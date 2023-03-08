const { fetch } = require('undici');
const BASE_URL = 'https://api.spotify.com/v1';

module.exports = class Spotify {
    constructor(client) {
        this.client_id = client.config.spotify.client_id;
        this.client_secret = client.config.spotify.client_secret;
        this.token = '';
        this.authorizations = `Basic ${Buffer.from(`${this.client_id}:${this.client_secret}`).toString('base64')}`;
        this.nextRefresh = '';
    }
    async makeRequest(endpoint) {
        const res = await fetch(`${BASE_URL}/${endpoint}`, {
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
        const data = await res.json();
        return data;
    }
    async refresh() {
        const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                Authorization: this.authorizations,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });
        const data = await res.json();
        this.token = data.access_token;
        this.nextRefresh = Date.now() + data.expires_in;
    }
    /**
     * 
     * @param {String} id 
     * @returns 
     */
    async getTrack(id) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`tracks/${id}`);
    }
    /**
     * 
     * @param {String} query 
     * @returns 
     */
    async search(query) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`search?q=${query}&type=track&limit=1`);
    }
    /**
     * 
     * @param {String} id 
     * @returns 
     */
    async getAlbum(id) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`albums/${id}`);
    }
    /**
     * 
     * @param {String} id 
     * @returns 
     */
    async getArtist(id) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`artists/${id}`);
    }
    /**
     * 
     * @param {String} id 
     * @returns 
     */
    async getPlaylist(id) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`playlists/${id}`);
    }
    /**
     * 
     * @param {String} id 
     * @returns 
     */
    async getShow(id) { 
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`shows/${id}`);
    }
    /**
     * 
     * @param {String} id 
     * @returns 
     */
    async getEpisode(id) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`episodes/${id}`);
    }
    /**
     * 
     * @param {String} id 
     * @returns 
     */
    async getRecommendations(seed_artists, seed_tracks, limit) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`recommendations?seed_artists=${seed_artists}&seed_tracks=${seed_tracks}&limit=${limit}`);
    }
    async getRecommendationGenres() {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`recommendations/available-genre-seeds`);
    }
    async getNewReleases(country, limit) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`browse/new-releases?country=${country}&limit=${limit}`);
    }
    async getFeaturedPlaylists(country, limit) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`browse/featured-playlists?country=${country}&limit=${limit}`);
    }
    async getCategories(country, limit) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`browse/categories?country=${country}&limit=${limit}`);
    }
    async getCategory(id, country, limit) {
        if (Date.now() >= this.nextRefresh) await this.refresh();
        return await this.makeRequest(`browse/categories/${id}?country=${country}&limit=${limit}`);
    }
    

}