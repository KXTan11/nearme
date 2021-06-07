class Place extends Parse.Object {
    
    constructor() {
        super('Place');
    }

    get title() {
        return this.get('title');
    }

    set title(val) {
        this.set('title', val);
    }

    get description() {
        return this.get('description');
    }

    set description(val) {
        this.set('description', val);
    }

    get phone() {
        return this.get('phone');
    }

    set phone(val) {
        this.set('phone', val);
    }

    get website() {
        return this.get('website');
    }

    set website(val) {
        this.set('website', val);
    }

    get address() {
        return this.get('address');
    }

    set address(val) {
        this.set('address', val);
    }

    get category() {
        return this.get('category');
    }

    set category(val) {
        this.set('category', val);
    }

    get image() {
        return this.get('image');
    }

    set image(val) {
        this.set('image', val);
    }

    get location() {
        return this.get('location');
    }

    set location(val) {
        var geoPoint = new Parse.GeoPoint({
            latitude: val.lat,
            longitude: val.lng
        });
        this.set('location', geoPoint);
    }

    get imageTwo() {
        return this.get('imageTwo');
    }

    get imageThree() {
        return this.get('imageThree');
    }

    get imageFour() {
        return this.get('imageFour');
    }

    get imageThumb() {
        return this.get('imageThumb');
    }

    get ratingCount() {
        return this.get('ratingCount');
    }

    get ratingTotal() {
        return this.get('ratingTotal');
    }

    get status() {
        return this.get('status');
    }

    get rating() {
        if (!this.ratingCount && !this.ratingTotal) return 0;
        return Math.round(this.ratingTotal / this.ratingCount);
    }
}

Parse.Object.registerSubclass('Place', Place)

module.exports = Place