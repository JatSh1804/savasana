
const arr = [1, 4, 123, 12, 9, 8];

function Merge(first, second) {
    const arr = [];
    let i = 0;
    let j = 0;
    let k = 0;

    while (i < first.length && j < second.length) {
        if (first[i] < second[j]) {
            arr.push(first[i]);
            i++;
        } else {
            arr.push(second[j]);
            j++;
        }
        k++;
    }

    while (i < first.length) {
        arr.push(first[i])
        i++;
        k++;
    }
    while (j < second.length) {
        arr.push(second[j]);
        j++;
        k++;
    }
    return arr
}


function MergeSort(arr) {
    if (arr.length === 1) return arr;

    const start = 0;
    const end = arr.length;

    const mid = Math.floor(start + (end - start) / 2);
    

    const left = MergeSort(arr.slice(start, mid));
    const right = MergeSort(arr.slice(mid, end))

    return Merge(left, right);
}

console.log(MergeSort(arr))