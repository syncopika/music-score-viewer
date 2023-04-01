import json
import os
import sys

if __name__ == "__main__":
    # TODO: use argparse later?
    if len(sys.argv) != 2:
        print("error: you need to supply a name for the new score")
        sys.exit()
        
    score_name = sys.argv[1]
    print(f"new score name: {score_name}")
    
    # create a new folder in /music
    new_folder_path = os.path.join("music", score_name)
    if os.path.exists(new_folder_path):
        print("error: a score with this name already exists")
        sys.exit()
    
    os.makedirs(new_folder_path)
    
    # add template json file
    json_template = {
        "name": score_name,
        "scorePath": f"music/{score_name}",
        "trackPaths": {
            "instrument": f"music/{score_name}/instrument.ogg",
        },
        "notes": ["something"],
        "duration": 0,
        "timeMarkers": {},
    }
    
    new_file_path = os.path.join(new_folder_path, f"{score_name}.json")
    print(new_file_path)
    with open(new_file_path, 'w') as f:
        json.dump(json_template, f, indent=4)
        
    print("done!")