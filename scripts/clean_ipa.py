import os, zipfile, glob, sys

app_dirs = glob.glob("build/Build/Products/Release-iphoneos/*.app")
if not app_dirs:
    print("ERROR: no .app found!")
    sys.exit(1)
app_dir = app_dirs[0]
print("App dir: " + app_dir)

print("\n=== Scanning for signatures ===")
for root, dirs, files in os.walk(app_dir, followlinks=False):
    for d in dirs:
        if d == "_CodeSignature":
            print("  FOUND: " + os.path.join(root, d))
    for f in files:
        if f.endswith(".mobileprovision") or f.endswith(".entitlements"):
            print("  FOUND: " + os.path.join(root, f))

files_to_add = []
skip_count = 0
SKIP_DIRS = {"_CodeSignature", "__MACOSX"}
SKIP_EXTS = (".mobileprovision", ".entitlements")

for root, dirs, files in os.walk(app_dir, followlinks=False):
    dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
    for f in files:
        full = os.path.join(root, f)
        rel = os.path.relpath(full, app_dir).replace(os.sep, "/")
        if f.endswith(SKIP_EXTS) or "_CodeSignature" in rel:
            print("  SKIP: " + rel)
            skip_count += 1
            continue
        zip_path = "Payload/" + os.path.basename(app_dir) + "/" + rel
        files_to_add.append((zip_path, full))

print("\nSkipped: %d, Adding: %d" % (skip_count, len(files_to_add)))

ipa_path = "command-helper.ipa"
if os.path.exists(ipa_path):
    os.remove(ipa_path)

with zipfile.ZipFile(ipa_path, "w", zipfile.ZIP_DEFLATED) as zf:
    for zp, fp in files_to_add:
        zf.write(fp, zp)

print("\nIPA written: %s (%d bytes)" % (ipa_path, os.path.getsize(ipa_path)))

print("\n=== Verification ===")
with zipfile.ZipFile(ipa_path, "r") as zf:
    names = zf.namelist()
    has_cs = any("_CodeSignature" in n for n in names)
    has_mp = any(".mobileprovision" in n for n in names)
    has_ent = any(".entitlements" in n for n in names)
    has_info = any("Info.plist" in n for n in names)
    print("  Total files: %d" % len(names))
    print("  _CodeSignature:    %s" % ("FAIL - STILL EXISTS!" if has_cs else "OK - clean"))
    print("  mobileprovision:   %s" % ("FAIL - STILL EXISTS!" if has_mp else "OK - clean"))
    print("  entitlements:      %s" % ("FAIL - STILL EXISTS!" if has_ent else "OK - clean"))
    print("  Info.plist:        %s" % ("OK" if has_info else "FAIL - MISSING!"))
    if has_cs or has_mp:
        print("\nResidual paths:")
        for n in names:
            if "_CodeSignature" in n or ".mobileprovision" in n:
                print("  " + n)
        sys.exit(1)
    print("\nALL CLEAN!")
