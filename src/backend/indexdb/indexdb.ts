/**
 * IndexDb 帮助类
 */

const win: { [k: string]: any } = window || globalThis;
const indexedDB =
	win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;
const dbs: { [k: string]: IDBDatabase } = {};
let databaseName: string;
let request: IDBOpenDBRequest;
interface AnyEvent {
	[k: string]: any;
}

export interface TableOption {
	storeName: string;
	option: { [K: string]: any };
	index: { [K: string]: any }[];
}

export const createDB = (
	name: string,
	version?: string,
	options?: TableOption[],
) =>
	new Promise<IDBDatabase>((resolve, reject) => {
		if (!indexedDB) reject('浏览器不支持indexedDB');
		databaseName = name;
		if (dbs?.[name]) {
			resolve(dbs[name]);
			return;
		}
		request = indexedDB.open(name, version);
		createTable(options)?.then((db: IDBDatabase) => resolve(db));
		request.onsuccess = (event: AnyEvent) => {
			// IDBDatabase
			const db = event.target.result;
			// 缓存起来
			dbs[name] = db;
			resolve(db);
		};
		request.onerror = (event: AnyEvent) => reject(event);
	});

export const createTable = (options?: TableOption[]) => {
	if (!options) return;
	return new Promise<IDBDatabase>((resolve) => {
		request.onupgradeneeded = (event: AnyEvent) => {
			const db = event.target.result;
			dbs[databaseName] = db;
			for (const i in options) {
				// 判断是否存在表
				if (!db.objectStoreNames.contains(options[i].storeName)) {
					const objectStore = db.createObjectStore(
						options[i].storeName,
						options[i].option,
					);
					for (const j of options[i].index) {
						objectStore.createIndex(j.name, j.keyPath, {
							unique: j.unique,
						});
					}
				}
			}
			resolve(db);
		};
	});
};

const getTransaction = async (name: string, version?: string) => {
	let db: IDBDatabase;
	// 先从缓存获取
	if (dbs[databaseName]) {
		db = dbs[databaseName];
	} else {
		db = await createDB(databaseName, version);
	}
	return db.transaction(name, 'readwrite');
};

const getObjectStore = async (
	name: string,
	version?: string,
): Promise<IDBObjectStore> => {
	const transaction = await getTransaction(name, version);
	return transaction.objectStore(name);
};

const getStore = (name: string, type: string, data: any) =>
	new Promise<IDBDatabase>((resolve) => {
		getObjectStore(name).then((objectStore: IDBObjectStore | any) => {
			const request = objectStore[type](data);
			request.onsuccess = (event: AnyEvent) =>
				resolve(event.target.result);
		});
	});


const findStore = (
	name: string,
	start: any,
	end: any,
	startInclude: any,
	endInclude: any,
) =>
	new Promise<IDBDatabase>((resolve, reject) => {
		getObjectStore(name).then((objectStore: IDBObjectStore) => {
			const request = objectStore.openCursor(
				IDBKeyRange.bound(start, end, startInclude, endInclude),
			);
			request.onsuccess = (event: AnyEvent) =>
				resolve(event.target.result);
			request.onerror = (event: AnyEvent) => reject(event);
		});
	});

export interface DBSelect {
	add: (data: any) => Promise<IDBDatabase>;
	get: (data: any) => Promise<IDBDatabase>;
	getAll: () => Promise<IDBDatabase>;
	del: (data: any) => Promise<IDBDatabase>;
	clear: (data: any) => Promise<IDBDatabase>;
	put: (data: any) => Promise<IDBDatabase>;
	find: (
		start: any,
		end: any,
		startInclude: any,
		endInclude: any,
	) => Promise<IDBDatabase>;
}
// 获取一个store
export const onDBSelect = async (
	name: string,
	version: string
): Promise<DBSelect> => {
	const add = (data: any) => getStore(name, 'add', data);
	const get = (data: any) => getStore(name, 'get', data);
	const getAll = () => getStore(name, 'getAll', null);
	const del = (data: any) => getStore(name, 'delete', data);
	const clear = (data: any) => getStore(name, 'clear', data);
	const put = (data: any) => getStore(name, 'put', data);
	const find = (start: any, end: any, startInclude: any, endInclude: any) =>
		findStore(name, start, end, startInclude, endInclude);
	const options: DBSelect = { add, get, getAll, clear, del, put, find };
	getObjectStore(name, version);
	return options;
};