const core = require('@actions/core');
const OSS = require('ali-oss');
const fg = require('fast-glob');

async function run() {
    const cwd = core.getInput('cwd');
    if (cwd) {
        process.chdir(cwd);
    }
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
    const headers = {};
    if (tagging) {
        headers['x-oss-tagging'] = tagging;
    }
    if (storageClass) {
        headers['x-oss-storage-class'] = storageClass;
    }
    if (objectAcl) {
        headers['x-oss-object-acl'] = objectAcl;
    }
    if (overwrite) {
        headers['x-oss-forbid-overwrite'] = overwrite;
    }

    const files = fg.sync(localPath, { onlyFiles: true, dot: true });

    await Promise.all(files.map(async file => store.put(remotePath + file, file)));
    core.setOutput('upload success\n', files.join('\n'));
}

run().catch(error => core.setFailed(error.message));