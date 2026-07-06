import re

file_path = "c:/Users/Dreasy.AndresPC/Documents/GymRerunApp/src/components/GymRerunAssistant.tsx"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the lg:pr-[340px] from main
content = content.replace("lg:pr-[340px]", "")

# 2. Add OVERLAY_CLASSES constant
if "const OVERLAY_CLASSES" not in content:
    # Insert it right before the GymRerunAssistant export
    import_idx = content.find("export default function GymRerunAssistant")
    if import_idx != -1:
        overlay_const = "const OVERLAY_CLASSES = \"fixed inset-0 z-[75] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 overlay-enter\";\n\n"
        content = content[:import_idx] + overlay_const + content[import_idx:]

# 3. Replace fixed inset-0 classNames using regex
# standard: className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-3"
content = re.sub(r'className="fixed inset-0 z-\[?\d+\]? bg-black/\d+ flex items-center justify-center(?: p-3)?"', 'className={OVERLAY_CLASSES}', content)
# with backdrop blur: className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
content = re.sub(r'className="fixed inset-0 z-\[?\d+\]? bg-black/\d+ backdrop-blur-sm flex items-center justify-center(?: p-4)?"', 'className={OVERLAY_CLASSES}', content)
# other one: className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center"
content = re.sub(r'className="fixed inset-0 z-\[?\d+\]? bg-black/\d+ flex items-center justify-center"', 'className={OVERLAY_CLASSES}', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done replacing classes.")
