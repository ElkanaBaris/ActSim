import yaml
import json
import os

YAML_PATH = os.path.join('Content', 'Scenarios', 'example_scenario.yaml')
JSON_PATH = os.path.join('Content', 'Scenarios', 'example_scenario.json')

def main():
    with open(YAML_PATH, 'r') as yf:
        data = yaml.safe_load(yf)

    with open(JSON_PATH, 'w') as jf:
        json.dump(data, jf, indent=2)
    print(f"Converted {YAML_PATH} -> {JSON_PATH}")

if __name__ == '__main__':
    main()
