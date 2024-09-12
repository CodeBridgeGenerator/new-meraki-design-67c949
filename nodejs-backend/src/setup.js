const fs = require('fs');
const fileFolder = './src/resources';
const camelCase = require('./utils/camelCase');

module.exports = async (app) => {
    await initializeDatabase(app);
    console.log('Setup completed.');
};

const initializeDatabase = async (app) => {
    const userEmail = 'kana@cloudbasha.com';
    const getUserEmail = await app.service('userInvites').find({
        query: {
            emailToInvite: userEmail
        }
    });

    if (getUserEmail?.data?.length === 0) {
        const user = await app.service('userInvites').create({
            emailToInvite: userEmail,
            status: false,
            sendMailCounter: 0
        });
        console.debug('user created');
        await insertEmailTemplates(app, user._id);
    } else {
        await insertEmailTemplates(app, getUserEmail?.data[0]?._id);
        console.debug('user exists ');
    }
};

const insertEmailTemplates = async (app) => {
    const files = fs.readdirSync(fileFolder);
    const promises = [];
    const services = [];
    files.forEach((file) => {
        const names = file.split('.');
        const service = camelCase(names[1]);
        if (service !== "json") {
            const existing = app.service(service).find({});
            promises.push(existing);
            services.push(service);
          }
    });
    const allData = await Promise.all(promises);
    services?.forEach((service, i) => {
        // console.log(allData[i]?.data, files[i], service);
        insertData(app, allData[i]?.data, files[i], service);
    });

    console.debug('Setup completed.');
};

const insertData = (app, existing, file, service) => {
    const dataNew = require(`./resources/${file}`);
    const existingNames = existing?.map((t) => t.name);
    const inserts = [];
    const promises = [];
    if (dataNew.length === 0) return;
    dataNew?.forEach((n, i) => {
        if (!existingNames?.includes(n.name)) {
            const temp = n;
            delete temp?._id;
            delete temp?.__v;
            delete temp?.createdAt;
            delete temp?.updatedAt;
            inserts.push(temp);
        }
    });
    if (inserts?.length > 0) {
        promises.push(app.service(service).create(inserts));
        console.debug('inserted', service, inserts?.length);
    }
    Promise.all(promises);
};