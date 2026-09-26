#!/usr/bin/env python3
"""
SRIJAN - SECURE LOCAL SIH JUDGE DEMO CONTROLLER
Controls telemetry scenarios on the deployed backend via REST API.
"""

import os
import sys
import time
import json
import urllib.request
import urllib.error
import urllib.parse

# Ensure stdout handles UTF-8 gracefully on Windows terminal
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

DEFAULT_API_BASE_URL = "https://sih26008-production.up.railway.app"

VALID_SCENARIOS = {
    "1": ("NORMAL", "Normal Baseline Operation"),
    "2": ("BELT_MISALIGNMENT", "Tracking drift demonstration"),
    "3": ("HIGH_VIBRATION", "Mechanical vibration demonstration"),
    "4": ("MOTOR_OVERLOAD", "Drive/load demonstration"),
    "5": ("SPLICE_DEGRADATION", "Intermittent splice-behaviour demonstration"),
}

SCENARIO_ALIAS = {
    "NORMAL": "NORMAL",
    "BELT_MISALIGNMENT": "BELT_MISALIGNMENT",
    "MISALIGNMENT": "BELT_MISALIGNMENT",
    "HIGH_VIBRATION": "HIGH_VIBRATION",
    "VIBRATION": "HIGH_VIBRATION",
    "MOTOR_OVERLOAD": "MOTOR_OVERLOAD",
    "OVERLOAD": "MOTOR_OVERLOAD",
    "SPLICE_DEGRADATION": "SPLICE_DEGRADATION",
    "SPLICE": "SPLICE_DEGRADATION",
}


def get_config():
    secret = os.getenv("DEMO_CONTROL_SECRET")
    base_url = os.getenv("DEMO_API_BASE_URL", DEFAULT_API_BASE_URL).rstrip("/")
    return secret, base_url


def fetch_json(url, timeout=5, headers=None):
    req = urllib.request.Request(url, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {"detail": body}
        return e.code, parsed
    except urllib.error.URLError as e:
        return 0, {"detail": f"Network failure: {e.reason}"}
    except Exception as e:
        return 0, {"detail": f"Unexpected error: {str(e)}"}


def post_scenario(base_url, secret, scenario):
    url = f"{base_url}/api/demo/scenario?scenario={urllib.parse.quote(scenario)}"
    headers = {
        "X-Demo-Secret": secret,
        "Content-Type": "application/json",
    }
    req = urllib.request.Request(url, method="POST", headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=8) as response:
            body = response.read().decode("utf-8")
            return response.status, json.loads(body)
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed = json.loads(body)
        except Exception:
            parsed = {"detail": body}
        return e.code, parsed
    except urllib.error.URLError as e:
        return 0, {"detail": f"Backend unavailable: {e.reason}"}
    except Exception as e:
        return 0, {"detail": f"Request failed: {str(e)}"}


def check_health(base_url):
    code, data = fetch_json(f"{base_url}/health", timeout=5)
    if code == 200 and data.get("status") == "ok":
        return True, data
    return False, data


def get_system_status(base_url):
    telemetry_code, telemetry = fetch_json(f"{base_url}/api/telemetry/latest")
    condition_code, condition = fetch_json(f"{base_url}/api/condition/summary")
    anomaly_code, anomaly = fetch_json(f"{base_url}/api/anomaly/status")
    alerts_code, alerts = fetch_json(f"{base_url}/api/alerts/count")
    ds_code, ds = fetch_json(f"{base_url}/api/decision-support/summary")

    return {
        "telemetry": telemetry if telemetry_code == 200 else {},
        "condition": condition if condition_code == 200 else {},
        "anomaly": anomaly if anomaly_code == 200 else {},
        "alerts": alerts if alerts_code == 200 else {},
        "decision": ds if ds_code == 200 else {},
    }


def print_status_summary(base_url):
    status_data = get_system_status(base_url)
    tel = status_data["telemetry"]
    cond = status_data["condition"]
    anom = status_data["anomaly"]
    alt = status_data["alerts"]
    dec = status_data["decision"]

    scenario = tel.get("scenario", "UNKNOWN")
    temp = tel.get("temperature", 0.0)
    vib = tel.get("vibration", 0.0)
    curr = tel.get("current", 0.0)
    spd = tel.get("speed", 0.0)
    align = tel.get("alignment", 0.0)
    load = tel.get("load", 0.0)

    overall_risk = cond.get("overall", {}).get("risk_index", 0.0)
    splice_risk = cond.get("splice", {}).get("risk_index", 0.0)
    cond_level = cond.get("overall", {}).get("level", "UNKNOWN")

    anom_idx = anom.get("anomaly_index", 0.0)
    anom_pat = anom.get("status", "UNKNOWN")

    active_alerts = alt.get("active", 0)

    dec_level = dec.get("level", "NORMAL")

    align_str = f"+{align:.1f}" if align >= 0 else f"{align:.1f}"

    print("\n----------------------------------------")
    print("SRIJAN LIVE SYSTEM STATUS")
    print("----------------------------------------")
    print("\nScenario:")
    print(scenario)
    print("\nTelemetry:")
    print(f"Temperature     {temp:.1f} \u00b0C")
    print(f"Vibration       {vib:.2f} g")
    print(f"Current         {curr:.2f} A")
    print(f"Speed           {spd:.2f} m/s")
    print(f"Alignment       {align_str} mm")
    print(f"Load            {load:.1f} %")
    print("\nCondition:")
    print(f"Overall Risk    {overall_risk:.1f} / 100")
    print(f"Splice Risk     {splice_risk:.1f} / 100")
    print(f"Level           {cond_level}")
    print("\nAnomaly:")
    print(f"Index           {anom_idx:.1f} / 100")
    print(f"Pattern         {anom_pat}")
    print("\nAlerts:")
    print(f"Active          {active_alerts}")
    print("\nDecision Support:")
    print(dec_level)
    print("----------------------------------------\n")


def watch_transition(base_url, duration=30):
    print(f"\n[WATCH] Polling live status every 1s for {duration} seconds. Press Ctrl+C to stop.\n")
    start = time.time()
    try:
        while time.time() - start < duration:
            tel_code, tel = fetch_json(f"{base_url}/api/telemetry/latest")
            cond_code, cond = fetch_json(f"{base_url}/api/condition/summary")
            anom_code, anom = fetch_json(f"{base_url}/api/anomaly/status")
            alt_code, alt = fetch_json(f"{base_url}/api/alerts/count")
            ds_code, ds = fetch_json(f"{base_url}/api/decision-support/summary")

            scen = tel.get("scenario", "N/A") if tel_code == 200 else "N/A"
            temp = tel.get("temperature", 0.0) if tel_code == 200 else 0.0
            vib = tel.get("vibration", 0.0) if tel_code == 200 else 0.0
            spd = tel.get("speed", 0.0) if tel_code == 200 else 0.0
            align = tel.get("alignment", 0.0) if tel_code == 200 else 0.0
            risk = cond.get("overall", {}).get("risk_index", 0.0) if cond_code == 200 else 0.0
            anom_idx = anom.get("anomaly_index", 0.0) if anom_code == 200 else 0.0
            active_alerts = alt.get("active", 0) if alt_code == 200 else 0
            ds_level = ds.get("level", "N/A") if ds_code == 200 else "N/A"

            ts = time.strftime("%H:%M:%S")
            print(f"[{ts}] Scen: {scen:<18} Temp: {temp:4.1f}\u00b0C | Vib: {vib:4.2f}g | Spd: {spd:4.2f}m/s | Align: {align:+5.1f}mm | Risk: {risk:4.1f} | Anom: {anom_idx:4.1f} | Alerts: {active_alerts} | DS: {ds_level}")
            time.sleep(1.0)
    except KeyboardInterrupt:
        print("\n[WATCH] Stopped watch mode.")


def trigger_scenario(base_url, secret, scenario):
    print(f"\nREQUESTING: {scenario}")
    code, resp = post_scenario(base_url, secret, scenario)

    if code == 200:
        if scenario == "NORMAL":
            print("\nRETURNING TO NORMAL BASELINE")
            print("Backend recovery and telemetry transition started (takes ~15-25s).\n")
        else:
            print("\nSCENARIO ACCEPTED")
            print("Transition started (simulator transitions gradually over ~15–25s).\n")
        return True
    elif code in (401, 403):
        print(f"\n[ERROR] Authentication / Authorization Failed ({code}).")
        print(f"Detail: {resp.get('detail', 'Invalid or missing demo secret / Scenario control disabled.')}")
        print("Please check your local DEMO_CONTROL_SECRET setting.\n")
    elif code == 503:
        print("\n[ERROR] Demo control not configured on backend (503).")
        print(f"Detail: {resp.get('detail', 'DEMO_CONTROL_SECRET missing on server.')}\n")
    elif code == 400:
        print(f"\n[ERROR] Invalid scenario requested ({code}).")
        print(f"Detail: {resp.get('detail', 'Rejected scenario')}\n")
    else:
        print(f"\n[ERROR] Request failed with code {code}.")
        print(f"Detail: {resp.get('detail', 'Unknown backend error')}\n")
    return False


def display_menu(base_url):
    print("\n" + "=" * 40)
    print(" SRIJAN // SIH DEMO CONTROLLER")
    print("=" * 40)
    print("\nCURRENT BACKEND:")
    print("Railway Production" if "railway.app" in base_url else base_url)
    print()
    print("[1] NORMAL")
    print()
    print("[2] BELT MISALIGNMENT")
    print("    Tracking drift demonstration")
    print()
    print("[3] HIGH VIBRATION")
    print("    Mechanical vibration demonstration")
    print()
    print("[4] MOTOR OVERLOAD")
    print("    Drive/load demonstration")
    print()
    print("[5] SPLICE DEGRADATION")
    print("    Intermittent splice-behaviour demonstration")
    print()
    print("[R] RETURN TO NORMAL")
    print("[S] SHOW CURRENT STATUS")
    print("[W] WATCH TRANSITION")
    print("[Q] EXIT")
    print("=" * 40 + "\n")


def check_exit_safety(base_url):
    code, tel = fetch_json(f"{base_url}/api/telemetry/latest")
    if code == 200:
        scen = tel.get("scenario", "NORMAL")
        if scen != "NORMAL":
            print(f"\n[WARNING] CURRENT SCENARIO MAY REMAIN ACTIVE: {scen}")
            print("Use RESET / NORMAL before ending the SIH demonstration.\n")


def interactive_loop(base_url, secret):
    display_menu(base_url)
    while True:
        try:
            choice = input("Select option [1-5, R, S, W, Q]: ").strip().upper()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting controller.")
            check_exit_safety(base_url)
            break

        if choice == "Q":
            print("Exiting controller cleanly.")
            check_exit_safety(base_url)
            break
        elif choice in ("1", "R"):
            trigger_scenario(base_url, secret, "NORMAL")
        elif choice in VALID_SCENARIOS:
            scen_name = VALID_SCENARIOS[choice][0]
            trigger_scenario(base_url, secret, scen_name)
        elif choice == "S":
            print_status_summary(base_url)
        elif choice == "W":
            watch_transition(base_url)
        else:
            print(f"Invalid selection '{choice}'. Please choose from 1-5, R, S, W, Q.")


def main():
    secret, base_url = get_config()

    # Requirement 5: Check secret on launch
    if not secret or not secret.strip():
        print("DEMO_CONTROL_SECRET is not configured.")
        print("Set the local environment variable before using the controller.")
        sys.exit(1)

    # Health check on startup
    healthy, health_data = check_health(base_url)
    if not healthy:
        print(f"\n[ERROR] Railway backend at '{base_url}' is not reachable.")
        print(f"Health check failed: {health_data.get('detail', 'No response')}")
        sys.exit(1)

    # CLI direct argument execution mode
    if len(sys.argv) > 1:
        arg = sys.argv[1].strip().upper()
        if arg in ("--STATUS", "-S", "STATUS", "S"):
            print_status_summary(base_url)
            sys.exit(0)
        elif arg in ("--WATCH", "-W", "WATCH", "W"):
            watch_transition(base_url)
            sys.exit(0)
        
        target_scenario = SCENARIO_ALIAS.get(arg, arg)
        if target_scenario in ("NORMAL", "BELT_MISALIGNMENT", "HIGH_VIBRATION", "MOTOR_OVERLOAD", "SPLICE_DEGRADATION"):
            success = trigger_scenario(base_url, secret, target_scenario)
            sys.exit(0 if success else 1)
        else:
            print(f"[ERROR] Invalid scenario '{arg}'.")
            print("Allowed choices: NORMAL, BELT_MISALIGNMENT, HIGH_VIBRATION, MOTOR_OVERLOAD, SPLICE_DEGRADATION")
            sys.exit(1)

    # Interactive mode
    interactive_loop(base_url, secret)


if __name__ == "__main__":
    main()
