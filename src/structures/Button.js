module.exports = class Button {
    /**
     * 
     * @param {import('./Client')} client 
     * @param {String} options 
     */
    constructor(client, options) {
        this.client = client;
        this.id = options.id;
    }
};