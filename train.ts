// Task ZM:
/*
function reverseInteger(number: any) {
    const result = number.toString().split("").reverse().join("")
    console.log("one:", result)
    return result
}

console.log(reverseInteger("123456789"));
*/

//Task ZN

// Shunday function yozing, uni array va number parametri bo'lsin.
// Function'ning vazifasi ikkinchi parametr'da berilgan raqam, birinchi
// array parametr'ning indeksi bo'yicha hisoblanib, shu indeksgacha bo'lgan
// raqamlarni indeksdan tashqarida bo'lgan raqamlar bilan o'rnini
// almashtirib qaytarsin.
// MASALAN: rotateArray([1, 2, 3, 4, 5, 6], 3); return [5, 6, 1, 2, 3, 4];
/*
function rotateArray(arr: number[], index: number): number[] {
	if (index < 0 || index >= arr.length) {
	}

	const firstPaart = arr.slice(index + 1);
	console.log('one:', firstPaart);
	const secondPart = arr.slice(0, index + 1);
	console.log('two:', secondPart);

	return [...firstPaart, ...secondPart];
}

console.log(rotateArray([1, 2, 3, 4, 5, 6, 8], 3)); */
/*å
function areArraysEqual(one, two) {
    return one.sort().join() === two.sort().join();
}


console.log(areArraysEqual([1, 2, 3], [3, 1, 2]));
console.log(areArraysEqual([1, 2, 3], [3, 1, 2 ])); 
console.log(areArraysEqual([1, 2, 3], [4, 1, 2])); */

// Task ZQ
/*

function findDuplicates(one: number[]): number[] {
	const notRepeated = [];
	const repeated = [];

	for (const num of one) {
		if (notRepeated.includes(num) && !repeated.includes(num)) {
			repeated.push(num);
		} else if (!notRepeated.includes(num)) {
			notRepeated.push(num);
		}
	}
	console.log(repeated, notRepeated)
	return repeated;
}

console.log(findDuplicates([1, 2, 3, 4, 5, 4, 3, 4]));
*/

// Task: ZR
/*
function countNumberAndLetters(input: string): { number: number; letter: number } {
	let number = 0,
		letter = 0;

	for (const smt of input) {
		if (smt >= '0' && smt <= '9') {
			number++;
		} else if (smt >= 'a' && smt <= 'z') {
			letter++;
		}
	}
	return { number: number, letter: letter };
}

console.log(countNumberAndLetters('string152%¥'));  */
// return {number: 3, letter: 6};

// TASK ZS:

// Shunday function yozing, bu function parametrdagi array ichida
// bir marotaba takrorlangan element'ni qaytarsin

// MASALAN: singleNumber([4, 2, 1, 2, 1]); return 4;
/*
class T {
	[key: number]: number
}
function singleNumber(one: number[]): number {
	const single: T = {}

	for (const two of one) {
        single[two] = (single[two] || 0) + 1; 
    }

	for (const three of one) {
        if (single[three] === 1) {
            return three;
        }
    }
}




console.log(singleNumber([4, 2, 1, 2, 1])) */

// Task ZT:
/*
function firstUniqueCharIndex(input: string): number {
	const count: { [key: string]: number } = {};

	for (const check of input) {
		count[check] = (count[check] || 0) + 1;
	}

	for (let i = 0; i < input.length; i++) {
		if (count[input[i]] === 1) {
			return i;
		}
	}
}

console.log(firstUniqueCharIndex('stam')); // 0  */
/*
function stringToKebab(input: string): string {
	return input
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, '-');
}

console.log(stringToKebab('I love Kebab')); */

//Task: ZT
/*
function areParenthesesBalanced(input: string): boolean {
	let balance = 0;

	for (const one of input) {
		if (one === '(') {
			balance++;
		} else if (one === ')') {
			balance--;
		}
	}

	return balance === 0;
}

console.log(areParenthesesBalanced('string()ichida(qavslar)soni()balansda')); */



// TASK ZW 
function sumOfUnique(input: number[]) {

    input.map((ele, index) => {
        input.indexOf(ele);
        if (input.indexOf(ele) !== index) {
            input.splice(index, 1);
            input.splice(input.indexOf(ele), 1);
        }
    });
    return input.reduce((sum, ele) => sum + ele, 0);
} 

console.log(sumOfUnique([1,2,3,2]));