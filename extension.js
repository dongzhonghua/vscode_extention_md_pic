const vscode = require('vscode');
const { default: axios } = require('axios');
const fs = require("fs");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('"md-pic" is now active!');
	const dispos = vscode.commands.registerCommand("extention.upload", function () {
		vscode.window.showInformationMessage("active!");
	});
	context.subscriptions.push(dispos);

	let sub = context.subscriptions;
	sub.push(vscode.commands.registerCommand('extention.upload_remote', disposeRemotePic));
	sub.push(vscode.commands.registerCommand('extention.upload_local', disposeLocalPic));
}

exports.activate = activate;

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
		{
			password: false, // 输入内容是否是密码
			ignoreFocusOut: true, // 默认false，设置为true时鼠标点击别的地方输入框不会消失
			placeHolder: 'name', // 在输入框内的提示信息
			prompt: text, // 在输入框下方的提示信息
		}).then(res => {
			const pic_name = res + ".png";
			const pic_url = url.text;
			// upload(res + ".png", url.text);
			console.log('name: ' + pic_name + ', url: ' + pic_url);
			axios.get(encodeURI(pic_url),
				{
					responseType: 'arraybuffer'
				})
				.then(res => uploadGitee(pic_name, Buffer.from(res.data).toString('base64')))
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
			// var data = fs.readFileSync(path.substring(1));
			var data = fs.readFileSync(path);
			const base64Data = Buffer.from(data).toString('base64');
			const paths = path.split("/");
			const pic_name = paths[paths.length - 1];
			uploadGitee(pic_name, base64Data);
		});
}

// /**
//  * @param {string} pic_name
//  * @param {string} base64_data
//  */
// function upload(pic_name, base64_data) {
// 	const url = vscode.workspace.getConfiguration().get('pic.github_url');
// 	const name = vscode.workspace.getConfiguration().get('pic.github_name');
// 	const email = vscode.workspace.getConfiguration().get('pic.github_email');
// 	const auth = vscode.workspace.getConfiguration().get('pic.github_authorization');
// 	console.log(auth);
// 	const headers = { 'content-type': 'application/json', 'Authorization': auth };
// 	const jdata = JSON.stringify({
// 		"message": pic_name,
// 		"committer": {
// 			"name": name,
// 			"email": email
// 		},
// 		"content": base64_data
// 	});
// 	axios.put(url + pic_name, jdata, {
// 		headers: headers
// 	}
// 	).then(res => {
// 		console.log(res);
// 		if (res.status = 200) {
// 			const git_url = res.data["content"]["download_url"]
// 			console.log(git_url);
// 			vscode.window.activeTextEditor.edit(editBuilder => {
// 				const md_img = "![" + pic_name + "](" + git_url + ")";
// 				const end = new vscode.Position(vscode.window.activeTextEditor.selection.active.line + 1, 0);
// 				editBuilder.replace(new vscode.Range(new vscode.Position(vscode.window.activeTextEditor.selection.active.line, 0), end), md_img);
// 			});
// 		} else {
// 			console.error("upload url failed!")
// 			vscode.window.showInformationMessage("upload url failed, please try again!");
// 		}
// 	}).catch(function (error) {
// 		console.log(error);
// 		vscode.window.showInformationMessage("upload url failed, please try again!");
// 	});
// }

/**
 * @param {string} pic_name
 * @param {string} base64_data
 */
function uploadGitee(pic_name, base64_data) {
	const url = vscode.workspace.getConfiguration().get('pic.git');
	const auth = vscode.workspace.getConfiguration().get('pic.access_token');
	const headers = { 'Content-Type': 'application/json', 'charset': 'UTF-8' };
	const jdata = JSON.stringify({
		"access_token": auth,
		"message": pic_name,
		"content": base64_data
	});
	console.log(headers)
	console.log(jdata);

	axios.post(encodeURI(url + pic_name), jdata, {
		headers: headers
	}
	).then(res => {
		console.log(res);
		if (res.status = 200) {
			const git_url = res.data["content"]["download_url"]
			console.log(git_url);
			vscode.window.activeTextEditor.edit(editBuilder => {
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