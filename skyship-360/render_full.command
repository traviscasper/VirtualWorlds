#!/bin/bash
cd "$(dirname "$0")"
python3 render_360.py
read -p "Press Enter to close"
