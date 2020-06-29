export default function apiUrl(url: string): string {
    return (process.env.NODE_ENV !== 'prod' ? 'http://localhost:8080' : 'https://api-instagramclone.herokuapp.com') + url;
}
