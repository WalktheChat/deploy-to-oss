const core = require('@actions/core');
const OSS = require('ali-oss');
const glob = require('glob');

async function run() {
    const accessKeyId = core.getInput('accessKeyId', { required: true });
    const accessKeySecret = core.getInput('accessKeySecret', { required: true });
    const bucket = core.getInput('bucket', { required: true });
    const endpoint = core.getInput('endpoint');
    const region = core.getInput('region');
    const store = new OSS({
        region,
        endpoint,
        accessKeyId,
        accessKeySecret,
        bucket,
        secure: true,
    });
    const localPath = core.getInput('localPath', { required: true });
    const remotePath = core.getInput('remotePath', { required: true });

    const storageClass = core.getInput('storageClass');
    const objectAcl = core.getInput('objectAcl');
    const tagging = core.getInput('tagging');
    const overwrite = core.getInput('overwrite');
    const headers = {
        // 指定Object的存储类型。
        'x-oss-storage-class': storageClass || 'Standard',
        // 指定Object的访问权限。
        'x-oss-object-acl': objectAcl || 'private',
        // 指定PutObject操作时是否覆盖同名目标Object。此处设置为true，表示禁止覆盖同名Object。
        'x-oss-forbid-overwrite': overwrite || 'true',
    };
    if (tagging) {
        headers['x-oss-tagging'] = tagging;
    }

    const files = glob.sync(localPath);

    await Promise.all(files.map(async file => store.put(remotePath + file, file)));
    core.setOutput('upload success\n', files.join('\n'));
}

run().catch(error => core.setFailed(error.message));