import requests
import base64
res = requests.get("https://img30.360buyimg.com/uba/jfs/t20848/320/1132999703/64245/a47741fc/5b20d75eN83303d8b.png")
if __name__ == "__main__":
    print(base64.encodestring(res.text))