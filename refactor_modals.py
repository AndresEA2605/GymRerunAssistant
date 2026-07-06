import re

def refactor_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove lg:pr-[340px]
    content = content.replace("lg:pr-[340px]", "")

    # 2. Add ModalOverlay import if not there
    if "ModalOverlay" not in content and "GymRerunAssistant" in file_path:
        # Find imports
        import_idx = content.find("import ")
        if import_idx != -1:
            content = content[:import_idx] + "import { ModalOverlay } from './ui/ModalOverlay';\n" + content[import_idx:]

    # We will replace <div className="fixed inset-0... with <ModalOverlay...
    # We need to find each occurrence, parse it, and then find the matching closing </div>
    
    # Let's find all starting positions
    start_tag = '<div className="fixed inset-0'
    start_tag_alt = '<div className={`fixed inset-0'
    
    idx = 0
    while True:
        idx1 = content.find(start_tag, idx)
        idx2 = content.find(start_tag_alt, idx)
        
        if idx1 == -1 and idx2 == -1:
            break
            
        if idx1 != -1 and (idx2 == -1 or idx1 < idx2):
            pos = idx1
        else:
            pos = idx2
            
        # Find the end of the opening tag
        end_pos = content.find('>', pos)
        if end_pos == -1:
            break
            
        opening_tag = content[pos:end_pos+1]
        
        # Don't replace pointer-events-none (not a modal)
        if "pointer-events-none" in opening_tag or "historyExiting" in opening_tag:
            idx = end_pos
            continue
            
        # Extract onClick if exists
        onclick_match = re.search(r'onClick=\{([^}]+)\}', opening_tag)
        onclick_str = f' onClick={{{onclick_match.group(1)}}}' if onclick_match else ""
        
        # Extract z-index if exists
        z_match = re.search(r'z-\[?(\d+)\]?', opening_tag)
        z_str = f' zIndex={{{z_match.group(1)}}}' if z_match else ""
        
        # Determine align
        align_str = ' align="start"' if "items-start" in opening_tag else ""
        
        # New opening tag
        new_opening = f'<ModalOverlay{onclick_str}{z_str}{align_str}>'
        
        # Now find matching closing tag
        # We start searching from end_pos + 1
        div_count = 1
        curr_pos = end_pos + 1
        
        while div_count > 0 and curr_pos < len(content):
            next_div_open = content.find('<div', curr_pos)
            next_div_close = content.find('</div', curr_pos)
            
            if next_div_close == -1:
                break
                
            if next_div_open != -1 and next_div_open < next_div_close:
                div_count += 1
                curr_pos = next_div_open + 4
            else:
                div_count -= 1
                if div_count == 0:
                    closing_pos = next_div_close
                    # Replace closing tag
                    content = content[:closing_pos] + '</ModalOverlay>' + content[closing_pos+6:]
                    
                    # Replace opening tag
                    content = content[:pos] + new_opening + content[end_pos+1:]
                    
                    # Adjust index since string length changed
                    idx = pos + len(new_opening)
                    break
                else:
                    curr_pos = next_div_close + 5

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

refactor_file("c:/Users/Dreasy.AndresPC/Documents/GymRerunApp/src/components/GymRerunAssistant.tsx")
# Let's check if others have Modal overlays
try:
    refactor_file("c:/Users/Dreasy.AndresPC/Documents/GymRerunApp/src/components/DailyTasks.tsx")
except Exception as e:
    pass
try:
    refactor_file("c:/Users/Dreasy.AndresPC/Documents/GymRerunApp/src/components/HoOhGuide.tsx")
except Exception as e:
    pass
print("Refactoring complete")
