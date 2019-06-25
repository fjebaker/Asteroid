import json


class JSConfiger:
    def __init__(self, dict):
        self.dict = dict

    def build_config(self):
        try:
            jsonString = json.dumps(self.dict)
            printString = "function getConfigJSON() {return JSON.parse(" + \
                jsonString+");}\ncurrent_callback();"
            with open("src/main/web/dynamic/jsconfig.js", "w") as myFile:
                myFile.write(printString)
                return 1
        except:
            return 0
