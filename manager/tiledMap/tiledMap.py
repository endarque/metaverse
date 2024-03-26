'''
The file structure of tiled map data
------------ zip file type of extracted files in folders
- map_name.png                      # map image
- map_name.json                     # map data
- map_name.tmx                      # map project
- map_name.txt                      # map info(layer & tileset)
- Folder(tileset) - tileset_1.png    # Used tileset_1.png
                  - tileset_2.png    # Used tileset_2.png
                  - tileset_3.png    # Used tileset_3.png
                  ...
'''
import sys, os
import json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(os.path.dirname(__file__)))))
# import module.DB.module_DB as db

base_dir = os.path.dirname(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

path_to_find = os.path.join(base_dir, 'static/metaverse/asset/map')

dir_list = os.listdir(path_to_find)

def get_mapInformation(mapName):
    for map_type in dir_list:
        full_filepath = os.path.join(path_to_find, map_type)
        if os.path.isdir(full_filepath) and len(map_type) < 5:
            #print(map_type)
            for map_name in os.listdir(full_filepath):
                map_name_full_path = os.path.join(full_filepath, map_name)
                # print(map_name, mapName)
                if map_name == mapName:
                    for map_file in os.listdir(map_name_full_path):
                        ext = os.path.splitext(map_file)[-1]
                        if ext == '.png':
                            map_img_name = map_file
                        elif ext == '.txt':
                            f = open(os.path.join(map_name_full_path, map_file), 'r')
                            map_info_text_data = []
                            lines = f.readlines()
                            cnt = 0
                            for l in lines:
                                map_info_text_data.append(l.replace("\n", ""))
                                if l[0] == '[':
                                    # print(map_info_text_data)
                                    cnt = cnt + 1
                            f.close()
                            map_layer_num = int(cnt/2)

                        elif ext == '.json':
                            with open(os.path.join(map_name_full_path,map_file), 'r') as file:
                                json_data = json.load(file)
                                map_width = json_data['width']
                                map_height = json_data['height']
                                #print(json_data['width'], json_data['height'])
                    tilesetList = []
                    for tileset in os.listdir(map_name_full_path + '/assets'):
                        tilesetList.append(tileset)

                    # print(map_type, map_name, map_img_name, map_info_text_data, map_layer_num, map_width, map_height, tilesetList)
                    return map_type, map_name, map_img_name, map_info_text_data, map_layer_num, map_width, map_height, tilesetList


