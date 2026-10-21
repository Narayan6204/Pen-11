# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['main.py'],
    pathex=[],
    binaries=[],
    datas=[('app_icon.ico', '.'), ('app_icon.png', '.')],
    hiddenimports=['storage', 'process_manager', 'PyQt6', 'PyQt6.QtCore', 'PyQt6.QtGui', 'PyQt6.QtWidgets', 'PyQt6.QtNetwork'],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['PyQt6.QtQml', 'PyQt6.QtQuick', 'PyQt6.QtQuick3D', 'PyQt6.QtPdf', 'PyQt6.QtMultimedia', 'PyQt6.QtBluetooth'],
    noarchive=False,
    optimize=0,
)

# Exclude legacy Mesa software-rendered OpenGL (20.6 MB) - Pen 11 uses native Windows 11 Direct3D 11 GPU pipeline
a.binaries = [x for x in a.binaries if not x[0].lower().endswith('opengl32sw.dll')]

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='Pen 11',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    version='version_info.txt',
    icon=['app_icon.ico'],
)
