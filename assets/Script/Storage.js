let Storage = {
    setItem: (key, value) => {
        window.localStorage.setItem(key, value);
    },
    getItem: (key) => window.localStorage.getItem(key)
};
module.exports = Storage;
