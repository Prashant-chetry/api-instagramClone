const isEmpty = function (obj: object): boolean {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) return false;
        return true;
    }
    return true;
};
export default isEmpty;
