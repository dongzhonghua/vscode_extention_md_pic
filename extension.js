// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { default: axios } = require('axios');
const fs = require("fs");
const { url } = require('inspector');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('"md-pic" is now active!');
	let sub = context.subscriptions;
	sub.push(vscode.commands.registerCommand('md-pic.upload_remote', disposeRemotePic));
	sub.push(vscode.commands.registerCommand('md-pic.upload_local', disposeLocalPic));
}


exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}


function disposeRemotePic() {
	let editor = vscode.window.activeTextEditor;
	let document = editor.document;
	console.log(editor);
	console.log(document);
	const line = editor.selection.active.line;
	let url = document.lineAt(line);
	console.log(url.text);
	const text = '上传第' + line + '行链接图片：' + url.text + ' 至GitHub, 请输入图片名称';
	vscode.window.showInputBox(
		{ // 这个对象中所有参数都是可选参数
			password: false, // 输入内容是否是密码
			ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
			placeHolder: 'name', // 在输入框内的提示信息
			prompt: text, // 在输入框下方的提示信息
		}).then(res => {
			const pic_name = res + ".png";
			const pic_url = url.text;
			// upload(res + ".png", url.text);
			console.log('name: ' + pic_name + ', url: ' + pic_url);
			axios.get(pic_url,
				{
					responseType: 'arraybuffer'
				})
				.then(res => upload(pic_name, Buffer.from(res.data).toString('base64')))
				.catch(function (error) {
					console.log(error);
					vscode.window.showInformationMessage("download image failed, please try again!");
				});
		});
}

function disposeLocalPic() {
	vscode.window.showOpenDialog(
		{ // 可选对象
			canSelectFiles: true, // 是否可选文件
			canSelectFolders: false, // 是否可选文件夹
			canSelectMany: true, // 是否可以选择多个
			defaultUri: vscode.Uri.file("./"), // 默认打开本地路径
			openLabel: '上传'
		}).then(function (msg) {
			const path = msg[0].path;
			console.log(path);

			// fs.open('C:/Users/dong0/Pictures/0c48d612b37f0befee6238656c9c2bb3.jpg', 'r+', function (err, fd) {
			// 	if (err) {
			// 		return console.error(err);
			// 	}
			// 	fd.toString;
			// 	console.log("文件打开成功！");
			// });
			var data = fs.readFileSync(path.substring(1));
			const base64Data = Buffer.from(data).toString('base64');
			console.log(base64Data);
			const paths = path.split("/");
			const pic_name = paths[paths.length-1];
			upload(pic_name, base64Data);
		});
}

function upload(pic_name, base64_data) {
	const url = 'https://api.github.com/repos/dongzhonghua/dongzhonghua.github.io/contents/img/blog/';
	const headers = { 'content-type': 'application/json', 'Authorization': 'Bearer 078ff387f1a0e639b6fe820ae5454be9f263909a' };
	const jdata = JSON.stringify({
		"message": pic_name,
		"committer": {
			"name": "dongzhonghua",
			"email": "1518943695@qq.com"
		},
		"content": base64_data
	});
	axios.put(
		url + pic_name,
		jdata,
		{ headers: headers }
	).then(res => {
		if (res.status = 200) {
			const git_url = res.data["content"]["download_url"]
			console.log(git_url);
			vscode.window.activeTextEditor.edit(editBuilder => {
				// 从开始到结束，全量替换
				const md_img = "![" + pic_name + "](" + git_url + ")";
				const end = new vscode.Position(vscode.window.activeTextEditor.selection.active.line + 1, 0);
				editBuilder.replace(new vscode.Range(new vscode.Position(vscode.window.activeTextEditor.selection.active.line, 0), end), md_img);
			});
		} else {
			console.error("upload url failed!")
			vscode.window.showInformationMessage("upload url failed, please try again!");
		}

	}).catch(function (error) {
		console.log(error);
		vscode.window.showInformationMessage("upload url failed, please try again!");
	});
}