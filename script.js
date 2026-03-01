const USERS = ['飯田', '上阪', '宇田川', '小西', '義之', '喜多村', '武重', '平野', '亀田', '徳永', '永野', '西海', '山下', '丸山'];
const AM_WORK_OPTIONS = ['', '豆選別', '箱折', 'ドリップ', '豆選別/箱折', '豆選別/ドリップ', '欠勤', '通院', 'その他'];
const PM_WORK_OPTIONS = ['', '中学給食/豆選別', '小学給食／豆選別', '豆選別', '箱折', 'ドリップ', '豆選別/箱折', '豆選別/ドリップ', '豆選別／きぼう園', '欠勤'];
const PM_WORK_OPTIONS_SPECIAL = ['', '中学給食/豆選別', '小学給食／豆選別', '豆選別', '箱折', 'ドリップ', '豆選別/箱折', '豆選別/ドリップ', '豆選別／きぼう園', '中学給食／きぼう園', '欠勤'];
const PM_SPECIAL_USERS = ['山下', '宇田川'];

document.addEventListener('DOMContentLoaded', () => {
    initDate();
    renderInputTable();
    populateUserFilter();
    // Restore last selected staff
    const lastStaff = localStorage.getItem('last_staff');
    if (lastStaff) document.getElementById('staff-name').value = lastStaff;

    // 初回読み込み
    loadData();
});

function initDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('date-input').value = `${yyyy}-${mm}-${dd}`;
}

function loadData() {
    const date = document.getElementById('date-input').value;
    const allData = JSON.parse(localStorage.getItem('logs_db') || '[]');
    const dayData = allData.filter(r => r.date === date);

    // 一旦クリア（すべて空にする）
    USERS.forEach(user => {
        const amEl = document.getElementById('am-' + user);
        const pmEl = document.getElementById('pm-' + user);
        const noteEl = document.getElementById('note-' + user);

        if (amEl) amEl.value = '';
        if (pmEl) pmEl.value = '';
        if (noteEl) noteEl.value = '';
    });
    document.getElementById('absentees').value = '';
    document.getElementById('overall-staff').value = '';
    // 記入職員名は「最後に保存した名前」を維持する（入力の手間を省くため）

    if (dayData.length > 0) {
        dayData.forEach(r => {
            const amEl = document.getElementById('am-' + r.user);
            const pmEl = document.getElementById('pm-' + r.user);
            const noteEl = document.getElementById('note-' + r.user);

            if (amEl) amEl.value = r.am || '';
            if (pmEl) pmEl.value = r.pm || '';
            if (noteEl) noteEl.value = r.note || '';
        });
        // 共通項目（その日の最初のレコードから取得）
        document.getElementById('absentees').value = dayData[0].absentees || '';
        document.getElementById('overall-staff').value = dayData[0].overallStaff || '';
        if (dayData[0].staff) document.getElementById('staff-name').value = dayData[0].staff;
    }
}

function renderInputTable() {
    const tbody = document.getElementById('diary-table-body');
    tbody.innerHTML = '';

    USERS.forEach(user => {
        const tr = document.createElement('tr');

        // Name
        const tdName = document.createElement('td');
        tdName.className = 'user-name';
        tdName.textContent = user;

        // AM
        const tdAm = document.createElement('td');
        tdAm.appendChild(createSelect('am-' + user, AM_WORK_OPTIONS));

        // PM
        const tdPm = document.createElement('td');
        const pmOptions = PM_SPECIAL_USERS.includes(user) ? PM_WORK_OPTIONS_SPECIAL : PM_WORK_OPTIONS;
        tdPm.appendChild(createSelect('pm-' + user, pmOptions));

        // Note
        const tdNote = document.createElement('td');
        tdNote.className = 'note-cell';
        const textarea = document.createElement('textarea');
        textarea.id = 'note-' + user;
        textarea.placeholder = '特記事項を入力...';
        tdNote.appendChild(textarea);

        tr.appendChild(tdName);
        tr.appendChild(tdAm);
        tr.appendChild(tdPm);
        tr.appendChild(tdNote);
        tbody.appendChild(tr);
    });
}

function createSelect(id, options) {
    const select = document.createElement('select');
    select.id = id;
    select.style.width = '100%';
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        select.appendChild(option);
    });
    return select;
}

function populateUserFilter() {
    const filter = document.getElementById('user-filter');
    USERS.forEach(user => {
        const opt = document.createElement('option');
        opt.value = user;
        opt.textContent = user;
        filter.appendChild(opt);
    });
}

function switchTab(tab) {
    document.getElementById('input-section').classList.toggle('hidden', tab !== 'input');
    document.getElementById('view-section').classList.toggle('hidden', tab !== 'view');

    const btns = document.querySelectorAll('.tab-btn');
    btns[0].classList.toggle('active', tab === 'input');
    btns[1].classList.toggle('active', tab === 'view');

    if (tab === 'view') renderHistory();
}

function saveAll() {
    const date = document.getElementById('date-input').value;
    const staff = document.getElementById('staff-name').value;
    const absentees = document.getElementById('absentees').value;
    const overallStaff = document.getElementById('overall-staff').value;

    if (!staff) {
        alert('記入職員名を入力してください。');
        return;
    }
    localStorage.setItem('last_staff', staff);

    let allData = JSON.parse(localStorage.getItem('logs_db') || '[]');

    // 現在の日付のデータを一旦すべて削除（上書きのため）
    allData = allData.filter(r => r.date !== date);

    let count = 0;
    USERS.forEach(user => {
        const am = document.getElementById('am-' + user).value;
        const pm = document.getElementById('pm-' + user).value;
        const note = document.getElementById('note-' + user).value;

        if (am || pm || note) {
            allData.push({
                date, user, staff, am, pm, note,
                absentees, overallStaff,
                ts: Date.now()
            });
            count++;
        }
    });

    localStorage.setItem('logs_db', JSON.stringify(allData));
    alert(`${count}件のデータを保存しました。`);
}

function togglePreview() {
    const isPreview = document.body.classList.toggle('preview-active');
    const btn = document.getElementById('preview-btn');
    btn.textContent = isPreview ? 'プレビュー解除' : '表示プレビュー';
}

function renderHistory() {
    const user = document.getElementById('user-filter').value;
    const container = document.getElementById('history-container');
    container.innerHTML = '';

    if (!user) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-light); margin-top: 2rem;">利用者を選択してください。</p>';
        return;
    }

    const allData = JSON.parse(localStorage.getItem('logs_db') || '[]');
    const userRecords = allData
        .filter(r => r.user === user && r.note && r.note.trim() !== '')
        .sort((a, b) => a.date.localeCompare(b.date));

    if (userRecords.length === 0) {
        container.innerHTML = `<p style="text-align: center; margin-top: 2rem;">${user} さんの記録はありません。</p>`;
        return;
    }

    // Pagination config
    const RECORDS_PER_PAGE = 20;
    const totalPages = Math.ceil(userRecords.length / RECORDS_PER_PAGE);
    const headerTemplate = document.getElementById('print-header');

    for (let p = 0; p < totalPages; p++) {
        const pageContainer = document.createElement('div');
        pageContainer.className = 'page-container';

        // Add Header for each page
        const header = headerTemplate.cloneNode(true);
        header.classList.remove('hidden');
        header.querySelector('.print-user-name').textContent = user;
        header.querySelector('.print-page-number').textContent = p + 1;
        pageContainer.appendChild(header);

        // Add Table
        const table = document.createElement('table');
        table.className = 'record-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th class="col-date">日付</th>
                    <th class="col-note">記録</th>
                    <th class="col-staff">記入者</th>
                    <th class="col-action">操作</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        const start = p * RECORDS_PER_PAGE;
        const end = start + RECORDS_PER_PAGE;
        const pageRecords = userRecords.slice(start, end);

        pageRecords.forEach(r => {
            const tr = document.createElement('tr');
            const formattedDate = r.date.replace(/-/g, '/');
            tr.innerHTML = `
                <td class="col-date">${formattedDate}</td>
                <td class="col-note" style="padding: 8px;">${r.note || ''}</td>
                <td class="col-staff">${r.rowStaff || r.staff || ''}</td>
                <td class="col-action">
                    <button class="btn btn-outline btn-sm" onclick="editRecord('${r.date}', '${r.user}')">編集</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteRecord('${r.date}', '${r.user}')">削除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Add empty rows to fill the page
        const emptyRows = RECORDS_PER_PAGE - pageRecords.length;
        for (let i = 0; i < emptyRows; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td style="height:35px;"></td><td></td><td></td><td class="col-action"></td>';
            tbody.appendChild(tr);
        }

        pageContainer.appendChild(table);
        container.appendChild(pageContainer);
    }
}

function editRecord(date, user) {
    if (confirm(`${date} の ${user} さんのデータを編集しますか？`)) {
        // Switch to input tab
        switchTab('input');
        // Set date
        document.getElementById('date-input').value = date;
        // Trigger loadData to populate the table
        loadData();
        // Focus on the note or AM/PM of that user if needed (optional)
        const noteEl = document.getElementById('note-' + user);
        if (noteEl) {
            noteEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            noteEl.focus();
        }
    }
}

function deleteRecord(date, user) {
    if (confirm(`${date} の ${user} さんのデータを削除してもよろしいですか？`)) {
        let allData = JSON.parse(localStorage.getItem('logs_db') || '[]');
        const originalLength = allData.length;
        allData = allData.filter(r => !(r.date === date && r.user === user));

        if (allData.length < originalLength) {
            localStorage.setItem('logs_db', JSON.stringify(allData));
            alert('削除しました。');
            renderHistory(); // Refresh view
        }
    }
}

function exportData() {
    const data = localStorage.getItem('logs_db') || '[]';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily_logs_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);
            if (!Array.isArray(importedData)) throw new Error('形式が正しくありません');

            if (confirm('データを読み込みますか？ 現在の記録にマージ（統合）されます。')) {
                const currentData = JSON.parse(localStorage.getItem('logs_db') || '[]');

                // 同じ日付/利用者のデータがあれば今回読み込むもので上書きする
                const mergedMap = new Map();
                currentData.forEach(r => mergedMap.set(`${r.date}-${r.user}`, r));
                importedData.forEach(r => mergedMap.set(`${r.date}-${r.user}`, r));

                const finalData = Array.from(mergedMap.values()).sort((a, b) => b.date.localeCompare(a.date));

                localStorage.setItem('logs_db', JSON.stringify(finalData));
                alert('読み込みが完了しました。');
                location.reload();
            }
        } catch (err) {
            alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。');
        }
    };
    reader.readAsText(file);
}
