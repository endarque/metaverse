export const getLand = async id => {
    const res = await fetch('/api/room/${id}')
    if (res.ok) {
        const info = await res.json();
        return info;
    } else {
        const error = await res.json();
        console.error('An error occured getting all Land: ', error);
    }
}
