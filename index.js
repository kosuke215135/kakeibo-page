// ==========================================================
// 家計簿アプリ ロジック
// データは localStorage に保存し、ブラウザを閉じても残るようにする
// ==========================================================

// localStorage に保存するときのキー（名前）
const STORAGE_KEY = 'kakeibo-data';

// ---------- 操作するHTML要素を取得 ----------
const entryForm = document.getElementById('entry-form');
const dateInput = document.getElementById('date');
const typeInput = document.getElementById('type');
const itemInput = document.getElementById('item');
const amountInput = document.getElementById('amount');
const totalAmount = document.getElementById('total-amount');
const entryListBody = document.getElementById('entry-list-body');

// ---------- 種別（収入 / 支出） ----------
// 保存する値と、画面に表示する名前の対応表
const TYPE_LABELS = {
  income: '収入',
  expense: '支出',
};

// ---------- データの本体 ----------
// 1件は { date: '2026-10-17', type: 'expense', item: '食費', amount: 1000 } の形
let entries = [];

// ---------- localStorage からデータを読み込む ----------
function loadEntries() {
  const json = localStorage.getItem(STORAGE_KEY);

  // まだ保存されたデータがなければ空の配列で始める
  if (json === null) {
    return [];
  }

  // 保存内容が壊れていてもアプリが止まらないようにする
  try {
    const saved = JSON.parse(json);

    // 種別を追加する前に保存したデータには type がないため、支出として扱う
    return saved.map((entry) => ({
      ...entry,
      type: entry.type ?? 'expense',
    }));
  } catch (error) {
    console.error('保存データの読み込みに失敗しました', error);
    return [];
  }
}

// ---------- localStorage へデータを保存する ----------
function saveEntries() {
  // localStorage には文字列しか保存できないため JSON 文字列に変換する
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// ---------- 画面（一覧・合計金額）を描き直す ----------
function render() {
  // 一覧表の中身を一度空にする
  entryListBody.innerHTML = '';

  let total = 0;

  entries.forEach((entry) => {
    const row = document.createElement('tr');

    // 入力された文字をそのまま表示するため textContent を使う
    const dateCell = document.createElement('td');
    dateCell.textContent = entry.date;

    const typeCell = document.createElement('td');
    typeCell.textContent = TYPE_LABELS[entry.type];

    const itemCell = document.createElement('td');
    itemCell.textContent = entry.item;

    const amountCell = document.createElement('td');
    amountCell.textContent = entry.amount.toLocaleString();

    row.append(dateCell, typeCell, itemCell, amountCell);
    entryListBody.appendChild(row);

    // 収入は足し、支出は引く
    if (entry.type === 'income') {
      total += entry.amount;
    } else {
      total -= entry.amount;
    }
  });

  // 3桁区切りで収支合計を表示する（支出が多いとマイナスになる）
  totalAmount.textContent = total.toLocaleString();
}

// ---------- フォーム送信時の処理 ----------
entryForm.addEventListener('submit', (event) => {
  // ページの再読み込みを止める
  event.preventDefault();

  const date = dateInput.value;
  const type = typeInput.value;
  const item = itemInput.value.trim();
  // 入力値は文字列なので数値に変換する
  const amount = Number(amountInput.value);

  // 念のため入力内容をチェックする
  if (date === '' || !(type in TYPE_LABELS) || item === '' || !Number.isInteger(amount) || amount < 0) {
    return;
  }

  entries.push({ date, type, item, amount });
  saveEntries();
  render();

  // 入力欄を空に戻し、続けて入力しやすいように日付欄へ移動する
  entryForm.reset();
  dateInput.focus();
});

// ---------- ページ読み込み時の処理 ----------
entries = loadEntries();
render();
