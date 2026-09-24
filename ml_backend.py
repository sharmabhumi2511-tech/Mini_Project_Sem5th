#!/usr/bin/env python3
"""
GlucoseSense / DIA-PREDICT — Legacy Compatibility Launcher
===========================================================
Delegates execution directly to the modular industrial backend (server/app.py).
Retains full backward-compatibility with existing scripts and documentation.
"""

import sys
import os

# Add root directory to module search path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from server.app import create_app
from server.src.config.settings import Config

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", Config.PORT))
    print(f"[COMPAT] Launching GlucoseSense Backend from modular architecture (Port {port})...")
    app.run(host="0.0.0.0", port=port, debug=Config.DEBUG)
