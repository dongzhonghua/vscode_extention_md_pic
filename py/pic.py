import argparse
import base64
import random
import string
import sys
import requests
import json
from urllib.parse import unquote
import logging
#
# logging.basicConfig(filename='/Users/dzh/Documents/kuai/py-kuai/upload.log',
#                     format='%(asctime)s - %(pathname)s[line:%(lineno)d] - %(levelname)s: %(message)s',
#                     level=logging.DEBUG, filemode='a', datefmt='%Y-%m-%d %I:%M:%S %p')
url = 'https://api.github.com/repos/dongzhonghua/dongzhonghua.github.io/contents/img/blog/'
headers = {'content-type': 'application/json', 'Authorization': 'Bearer 078ff387f1a0e639b6fe820ae5454be9f263909a'}
data = {
    "message": "",
    "committer": {
        "name": "dongzhonghua",
        "email": "1518943695@qq.com"
    },
    "content": ""
}
image_name = ''

if len(sys.argv) == 1:
    sys.argv.append('--help')
parser = argparse.ArgumentParser()
parser.add_argument('-s', '--source', type=str, nargs='+', help="必须传入文件名参数", required=True)
args = parser.parse_args()
image_list = args.source


def get_data(img):
    with open(img, "rb") as f:
        file = f.read()
        encode_f = base64.b64encode(file)
    data['content'] = str(encode_f, encoding="utf-8")
    data['message'] = image_name
    return data


if __name__ == '__main__':
    for img in image_list:
        image_name = img.split("/")[-1]
        if len(image_name) > 50:
            image_name = ''.join(random.sample(string.ascii_letters + string.digits, 20)) \
                         + '.' + image_name.split(".")[-1]
        data = get_data(img)
        req = requests.put(url=url + image_name, data=json.dumps(data), headers=headers)
        # logging.info(unquote(req.json()['content']['download_url'], 'utf-8'))
        # logging.info(unquote(req.json(), 'utf-8'))
        # logging.info("*" * 100)
        print(unquote(req.json()['content']['download_url'], 'utf-8'))