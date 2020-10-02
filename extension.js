// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { default: axios } = require('axios');
const fs = require("fs")

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('"md-pic" is now active!');
	let disposable = vscode.commands.registerCommand('md-pic.helloWorld', function () {
		let editor = vscode.window.activeTextEditor;
		let document = editor.document;
		console.log(editor);
		console.log(document);
		const line = editor.selection.active.line;
		let url = document.lineAt(line);
		console.log(url.text);
		const text = '上传第' + line + '行链接图片：' + url.text + ' 至GitHub, 请输入图片名称'
		// vscode.window.showInformationMessage(text, 'yes', 'no')
		// 	.then(result => replaceUrl(result, url.text));

		vscode.window.showInputBox(
			{ // 这个对象中所有参数都是可选参数
				password: false, // 输入内容是否是密码
				ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
				placeHolder: 'name', // 在输入框内的提示信息
				prompt: text, // 在输入框下方的提示信息
			}).then(res => {
				upload(res + ".png", url.text);
			});

	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}

/**
 * @param {string} pic_name
 * @param {string} pic_url
 */
function upload(pic_name, pic_url) {
	console.log('name: ' + pic_name + ', url: ' + pic_url);
	axios.get(pic_url,
		{
			responseType: 'arraybuffer'
		})
		.then(function (res) {
			const data = Buffer.from(res.data).toString('base64')
			const url = 'https://api.github.com/repos/dongzhonghua/dongzhonghua.github.io/contents/img/blog/';
			const headers = { 'content-type': 'application/json', 'Authorization': 'Bearer 078ff387f1a0e639b6fe820ae5454be9f263909a' };
			const jdata = JSON.stringify({
				"message": pic_name,
				"committer": {
					"name": "dongzhonghua",
					"email": "1518943695@qq.com"
				},
				"content": data
			});
			console.log(url + pic_name);
			console.log(jdata);
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
			});
		}).catch(function (error) {
			console.log(error);
			vscode.window.showInformationMessage("upload url failed, please try again!");
		});
}