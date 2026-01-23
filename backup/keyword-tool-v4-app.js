// ========== ビッグキーワード候補表示 ==========
function showBigKeywordVariations() {
    const theme = document.getElementById('big-keyword-theme').value;
    const container = document.getElementById('big-keyword-variations');

    if (!theme || !BIG_KEYWORD_VARIATIONS[theme]) {
        container.classList.add('hidden');
        return;
    }

    const data = BIG_KEYWORD_VARIATIONS[theme];

    // テーマ名と合計ボリューム表示（Material Icons使用）
    document.getElementById('big-keyword-theme-name').innerHTML = `<span class="material-symbols-outlined icon-lg" style="vertical-align: middle;">${data.icon}</span> ${data.name}`;
    document.getElementById('big-keyword-total-volume').textContent = `合計推定ボリューム: ${data.estimatedVolume.toLocaleString()}/月`;

    // ボリュームフィルター適用
    const minVol = parseInt(document.getElementById('volume-filter-min')?.value) || 0;
    const maxVol = parseInt(document.getElementById('volume-filter-max')?.value) || Infinity;

    const filteredKeywords = data.keywords.filter(kw => kw.volume >= minVol && kw.volume <= maxVol);

    // フィルター結果の表示
    const filterInfo = document.getElementById('volume-filter-info');
    if (filterInfo) {
        if (filteredKeywords.length !== data.keywords.length) {
            filterInfo.textContent = `${filteredKeywords.length}/${data.keywords.length}件表示`;
            filterInfo.classList.remove('hidden');
        } else {
            filterInfo.classList.add('hidden');
        }
    }

    // キーワードリスト生成
    const listContainer = document.getElementById('big-keyword-list');
    if (filteredKeywords.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-gray-500 py-4">条件に一致するキーワードがありません</div>';
    } else {
        listContainer.innerHTML = filteredKeywords.map((kw, idx) => `
            <div class="flex items-center gap-3 p-2 ${idx === 0 ? 'bg-amber-100 rounded-lg' : 'border-b border-gray-100'}">
                <span class="w-6 h-6 rounded-full ${idx === 0 ? 'bg-amber-500' : 'bg-gray-300'} text-white text-xs flex items-center justify-center font-bold">${idx + 1}</span>
                <div class="flex-1">
                    <span class="font-medium text-gray-800">${kw.keyword}</span>
                    <span class="text-xs text-gray-500 ml-2">${kw.note}</span>
                </div>
                <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">${kw.volume.toLocaleString()}/月</span>
                <button type="button" onclick="copySingleKeyword('${kw.keyword}')" class="text-blue-500 hover:text-blue-700 text-xs underline">コピー</button>
            </div>
        `).join('');
    }

    container.classList.remove('hidden');
}

function copyBigKeywords() {
    const theme = document.getElementById('big-keyword-theme').value;
    if (!theme || !BIG_KEYWORD_VARIATIONS[theme]) return;

    // ボリュームフィルター適用
    const minVol = parseInt(document.getElementById('volume-filter-min')?.value) || 0;
    const maxVol = parseInt(document.getElementById('volume-filter-max')?.value) || Infinity;

    const filteredKeywords = BIG_KEYWORD_VARIATIONS[theme].keywords
        .filter(kw => kw.volume >= minVol && kw.volume <= maxVol)
        .map(kw => kw.keyword)
        .join('\n');

    if (!filteredKeywords) {
        showNotification('コピーするキーワードがありません', 'warning');
        return;
    }
    copyToClipboard(filteredKeywords, 'キーワードをコピーしました。ラッコキーワードで検索してください。');
}

function copySingleKeyword(keyword) {
    copyToClipboard(keyword, `「${keyword}」をコピーしました`);
}

function clearVolumeFilter() {
    const minInput = document.getElementById('volume-filter-min');
    const maxInput = document.getElementById('volume-filter-max');
    if (minInput) minInput.value = '';
    if (maxInput) maxInput.value = '';
    showBigKeywordVariations();
}

// ========== ステップ管理 ==========
function goToStep(step) {
    document.querySelectorAll('#step-1, #step-2, #step-3').forEach(el => el.classList.add('hidden'));
    document.getElementById(`step-${step}`).classList.remove('hidden');

    // インジケーター更新（3ステップ対応）
    for (let i = 1; i <= 3; i++) {
        const indicator = document.getElementById(`step-indicator-${i}`);
        if (!indicator) continue;
        indicator.className = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ';
        const circle = indicator.querySelector('span');

        if (i < step) {
            indicator.className += 'bg-green-100 text-green-700';
            circle.className = 'w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold';
        } else if (i === step) {
            indicator.className += 'bg-blue-600 text-white';
            circle.className = 'w-6 h-6 rounded-full bg-white text-indigo-600 flex items-center justify-center text-xs font-bold';
        } else {
            indicator.className += 'bg-gray-200 text-gray-500';
            circle.className = 'w-6 h-6 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold';
        }
    }
}

// ========== 記事設計タブ切り替え ==========
function showArticleMainTab(tab) {
    // タブボタンのスタイル更新
    document.querySelectorAll('.article-main-tab-btn').forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.className = 'article-main-tab-btn px-6 py-3 rounded-t-lg text-sm font-semibold bg-purple-100 text-purple-700 border-b-2 border-purple-600';
        } else {
            btn.className = 'article-main-tab-btn px-6 py-3 rounded-t-lg text-sm font-semibold bg-gray-100 text-gray-600 border-b-2 border-transparent hover:bg-gray-200';
        }
    });

    // タブコンテンツの表示切り替え
    document.querySelectorAll('.article-main-tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    const targetTab = document.getElementById(`article-main-tab-${tab}`);
    if (targetTab) {
        targetTab.classList.remove('hidden');
    }
}

// 競合分析結果を構成作成タブに反映して切り替え
function applyAndSwitchToDesign() {
    // 推奨構成をlocalStorageに保存
    localStorage.setItem('competitor-analysis-result', JSON.stringify(competitorHeadingsData));

    // 構成作成タブに切り替え
    showArticleMainTab('design');

    alert('競合分析の結果を保存しました。「記事構成を生成」ボタンで構成を作成してください。');
}

// ========== CSVファイル処理 ==========
let loadedCSVData = null; // CSVから読み込んだデータを保持
function initCSVDropzone() {
    const dropzone = document.getElementById('csv-dropzone');
    const fileInput = document.getElementById('csv-file-input');

    if (!dropzone || !fileInput) return;

    // クリックでファイル選択
    dropzone.addEventListener('click', () => fileInput.click());

    // ファイル選択時
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleCSVFile(e.target.files[0]);
        }
    });

    // ドラッグ＆ドロップ
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('border-green-500', 'bg-green-100');
    });
    dropzone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-green-500', 'bg-green-100');
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-green-500', 'bg-green-100');
        if (e.dataTransfer.files.length > 0) {
            handleCSVFile(e.dataTransfer.files[0]);
        }
    });
}

function handleCSVFile(file) {
    if (!file.name.endsWith('.csv')) {
        alert('CSVファイルを選択してください');
        return;
    }

    Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log('CSV解析結果:', results);
            loadedCSVData = parseCSVData(results.data);

            // ファイル情報表示
            document.getElementById('csv-dropzone').classList.add('hidden');
            document.getElementById('csv-file-info').classList.remove('hidden');
            document.getElementById('csv-filename').textContent = file.name;
            document.getElementById('csv-rowcount').textContent = `${loadedCSVData.length}件のキーワード`;
        },
        error: function(error) {
            alert('CSVファイルの読み込みに失敗しました: ' + error.message);
        }
    });
}

function parseCSVData(data) {
    const results = [];

    for (const row of data) {
        // キーワード列を探す
        let keyword = row['Keyword'] || row['キーワード'] || row['keyword'] || '';

        // ボリューム列を探す
        let volumeStr = row['Avg. monthly searches'] || row['月間平均検索ボリューム'] ||
                        row['Search Volume'] || row['検索ボリューム'] || '';

        if (!keyword) continue;

        // ボリュームを数値に変換
        let volume = 100; // デフォルト
        if (volumeStr) {
            // 「1万〜10万」「10〜100」形式
            const rangeMatch = volumeStr.toString().match(/(\d+(?:,\d+)?)(万)?[～~\-−](\d+(?:,\d+)?)(万)?/);
            if (rangeMatch) {
                let min = parseInt(rangeMatch[1].replace(/,/g, ''));
                let max = parseInt(rangeMatch[3].replace(/,/g, ''));
                if (rangeMatch[2] === '万') min *= 10000;
                if (rangeMatch[4] === '万') max *= 10000;
                volume = Math.round((min + max) / 2);
            } else {
                // 単純な数値
                const numMatch = volumeStr.toString().replace(/,/g, '').match(/(\d+)/);
                if (numMatch) {
                    volume = parseInt(numMatch[1]);
                }
            }
        }

        results.push({ keyword: keyword.trim(), volume });
    }

    return results;
}

function clearCSVFile() {
    loadedCSVData = null;
    document.getElementById('csv-dropzone').classList.remove('hidden');
    document.getElementById('csv-file-info').classList.add('hidden');
    document.getElementById('csv-file-input').value = '';
}

// 初期化時にCSVドロップゾーンを設定
document.addEventListener('DOMContentLoaded', initCSVDropzone);

// ========== キーワードプランナーデータ解析 ==========
function parseKeywordPlannerData(input) {
    const results = [];

    // デバッグ: 生データを表示
    console.log('=== 生データ ===');
    console.log(JSON.stringify(input));

    // タブ区切りでテーブル形式かチェック
    const lines = input.split('\n').filter(l => l.trim());

    // 各行を解析
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`行${i}: ${JSON.stringify(line)}`);

        // タブで分割してみる
        const tabCols = line.split('\t');
        console.log(`  タブ分割(${tabCols.length}): ${JSON.stringify(tabCols)}`);

        // 形式1: __keyword__ 形式
        const underscoreMatch = line.match(/__(.+?)__/);
        if (underscoreMatch) {
            let rawKeyword = underscoreMatch[1].trim();
            // 日本語文字間のスペースを削除、数字の前はスペース保持
            let keyword = rawKeyword
                .replace(/([ぁ-んァ-ヶー一-龯々])\s+([ぁ-んァ-ヶー一-龯々])/g, '$1$2')
                .replace(/\s+(\d)/g, ' $1')
                .replace(/(\d)\s+([ぁ-んァ-ヶー一-龯々])/g, '$1$2')
                .replace(/\s+/g, ' ')
                .trim();

            // 次の行からボリュームを取得
            let volume = 100;
            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1];
                if (!nextLine.includes('———') && !nextLine.match(/__/)) {
                    const rangeMatch = nextLine.match(/^(\d+(?:,\d+)?)(万)?[～~ー\-−](\d+(?:,\d+)?)(万)?/);
                    if (rangeMatch) {
                        let min = parseInt(rangeMatch[1].replace(/,/g, ''));
                        let max = parseInt(rangeMatch[3].replace(/,/g, ''));
                        if (rangeMatch[2] === '万') min *= 10000;
                        if (rangeMatch[4] === '万') max *= 10000;
                        volume = Math.round((min + max) / 2);
                    }
                }
            }

            if (keyword && keyword.length > 1) {
                results.push({ keyword, volume });
                console.log(`  → キーワード追加: ${keyword} (vol: ${volume})`);
            }
            continue;
        }

        // 形式2: タブ区切り形式（キーワード\tボリューム\t...）
        if (tabCols.length >= 2) {
            let keyword = tabCols[0].trim();
            // スペースで区切られた日本語を連結
            keyword = keyword
                .replace(/([ぁ-んァ-ヶー一-龯々])\s+([ぁ-んァ-ヶー一-龯々])/g, '$1$2')
                .replace(/\s+(\d)/g, ' $1')
                .replace(/(\d)\s+([ぁ-んァ-ヶー一-龯々])/g, '$1$2')
                .replace(/\s+/g, ' ')
                .trim();

            // ヘッダー行や無効な行をスキップ
            if (!keyword || keyword === 'キーワード' || keyword.includes('月間') ||
                keyword === '低' || keyword === '中' || keyword === '高' ||
                keyword.length <= 1) {
                continue;
            }

            // ボリュームを探す
            let volume = 100;
            for (let j = 1; j < tabCols.length; j++) {
                const col = tabCols[j].trim();
                // 「1万～10万」「10～100」形式
                const rangeMatch = col.match(/^(\d+(?:,\d+)?)(万)?[～~ー\-−](\d+(?:,\d+)?)(万)?/);
                if (rangeMatch) {
                    let min = parseInt(rangeMatch[1].replace(/,/g, ''));
                    let max = parseInt(rangeMatch[3].replace(/,/g, ''));
                    if (rangeMatch[2] === '万') min *= 10000;
                    if (rangeMatch[4] === '万') max *= 10000;
                    volume = Math.round((min + max) / 2);
                    break;
                }
                // 単純な数値
                const numMatch = col.match(/^(\d+(?:,\d+)?)$/);
                if (numMatch) {
                    volume = parseInt(numMatch[1].replace(/,/g, ''));
                    break;
                }
            }

            results.push({ keyword, volume });
            console.log(`  → キーワード追加: ${keyword} (vol: ${volume})`);
        }
    }

    console.log('=== 解析結果 ===');
    console.log(results);
    return results;
}

// ========== サンプルデータ ==========
function loadSampleData() {
    try {
        const sample = `職長教育
職長教育 オンライン
職長教育 費用
職長教育 とは
職長教育 カリキュラム
職長教育 有効期限
職長教育 申し込み
職長教育 おすすめ
職長教育 義務
職長教育 対象者
職長 安全衛生責任者 違い
職長教育 web
職長教育 料金
職長教育 修了証
職長教育 時間
職長教育 再教育
職長教育 5年
フルハーネス 特別教育
フルハーネス 特別教育 オンライン
フルハーネス 特別教育 費用
足場 特別教育
足場 特別教育 オンライン`;

        // CSVをクリアして簡易モードに切り替え
        loadedCSVData = null;

        const dropzone = document.getElementById('csv-dropzone');
        const fileInfo = document.getElementById('csv-file-info');
        const keywordInput = document.getElementById('keyword-input');

        if (dropzone) dropzone.classList.remove('hidden');
        if (fileInfo) fileInfo.classList.add('hidden');

        // detailsを開いてテキストエリアを表示
        const details = document.querySelector('#step-1 details');
        if (details) {
            details.open = true;
        }

        if (keywordInput) {
            keywordInput.value = sample;
            // 入力後にフォーカスを当てる（視覚的フィードバック）
            keywordInput.focus();
            console.log('サンプルデータを読み込みました');
        } else {
            console.error('keyword-input要素が見つかりません');
            alert('エラー: テキストエリアが見つかりません');
        }
    } catch (e) {
        console.error('loadSampleData エラー:', e);
        alert('サンプルデータの読み込み中にエラーが発生しました: ' + e.message);
    }
}

// ========== 分析開始 ==========
function startAnalysis() {
    // CSVファイルがあればそれを優先、なければテキストエリアを使用
    if (loadedCSVData && loadedCSVData.length > 0) {
        // CSVから読み込んだデータを使用（実ボリューム）
        keywords = loadedCSVData.map(item => {
            const kw = item.keyword;
            let intent = '情報収集', cvExpect = 30;
            if (/申し込み|申込|予約|受講/.test(kw)) { intent = '購入意向'; cvExpect = 90; }
            else if (/料金|費用|価格|安い/.test(kw)) { intent = '購入意向'; cvExpect = 85; }
            else if (/おすすめ|比較|ランキング|どこがいい/.test(kw)) { intent = '比較検討'; cvExpect = 70; }
            else if (/オンライン|web|eラーニング/.test(kw)) { intent = '購入意向'; cvExpect = 80; }
            else if (/とは|意味|必要|義務/.test(kw)) { intent = '情報収集'; cvExpect = 25; }

            // 競合対策分析を追加
            const strategy = analyzeCompetitorStrategy(kw);
            return {
                keyword: kw, intent, cvExpect, volume: item.volume, cluster: null,
                contentType: strategy.contentType,
                contentTypeName: strategy.contentTypeName,
                competitorCoverage: strategy.competitorCoverage,
                diffPotential: strategy.diffPotential,
                strategyPriority: strategy.strategyPriority,
                recommendation: strategy.recommendation,
                targetIndustry: strategy.targetIndustry,
                primaryInfoType: strategy.primaryInfoType,
                kciStrength: strategy.kciStrength
            };
        });
    } else {
        // テキストエリアから取り込み（推定ボリューム使用）
        const input = document.getElementById('keyword-input').value;
        const lines = input.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) {
            alert('CSVファイルを選択するか、キーワードを入力してください');
            return;
        }
        keywords = lines.map(kw => {
            let intent = '情報収集', cvExpect = 30;
            if (/申し込み|申込|予約|受講/.test(kw)) { intent = '購入意向'; cvExpect = 90; }
            else if (/料金|費用|価格|安い/.test(kw)) { intent = '購入意向'; cvExpect = 85; }
            else if (/おすすめ|比較|ランキング|どこがいい/.test(kw)) { intent = '比較検討'; cvExpect = 70; }
            else if (/オンライン|web|eラーニング/.test(kw)) { intent = '購入意向'; cvExpect = 80; }
            else if (/とは|意味|必要|義務/.test(kw)) { intent = '情報収集'; cvExpect = 25; }

            // 推定検索ボリュームを取得
            const volume = estimateVolume(kw);

            // 競合対策分析を追加
            const strategy = analyzeCompetitorStrategy(kw);
            return {
                keyword: kw, intent, cvExpect, volume, cluster: null,
                contentType: strategy.contentType,
                contentTypeName: strategy.contentTypeName,
                competitorCoverage: strategy.competitorCoverage,
                diffPotential: strategy.diffPotential,
                strategyPriority: strategy.strategyPriority,
                recommendation: strategy.recommendation,
                targetIndustry: strategy.targetIndustry,
                primaryInfoType: strategy.primaryInfoType,
                kciStrength: strategy.kciStrength
            };
        });
    }

    // クラスタリング
    clusters = [];
    clusterDefinitions.forEach(def => {
        const matched = keywords.filter(kw =>
            def.patterns.some(p => kw.keyword.includes(p)) && !kw.cluster
        );
        if (matched.length > 0) {
            clusters.push({
                name: def.name,
                keywords: matched,
                priority: def.priority,
                cvExpect: def.cvExpect
            });
            matched.forEach(kw => kw.cluster = def.name);
        }
    });

    // 未分類
    const unassigned = keywords.filter(kw => !kw.cluster);
    if (unassigned.length > 0) {
        clusters.push({
            name: 'その他',
            keywords: unassigned,
            priority: 1,
            cvExpect: 30
        });
        unassigned.forEach(kw => kw.cluster = 'その他');
    }

    // ソート（優先スコア = CV期待度 × ボリューム）
    clusters.sort((a, b) => b.priority - a.priority || b.keywords.length - a.keywords.length);
    keywords.sort((a, b) => {
        const scoreA = a.cvExpect * Math.log10(a.volume + 1);
        const scoreB = b.cvExpect * Math.log10(b.volume + 1);
        return scoreB - scoreA;
    });

    // 表示更新
    renderAnalysisResult();
    goToStep(2);
}

// ========== 分析結果表示 ==========
function renderAnalysisResult() {
    // サマリー
    document.getElementById('summary-keywords').textContent = keywords.length;
    document.getElementById('summary-clusters').textContent = clusters.length;
    document.getElementById('summary-articles').textContent = clusters.filter(c => c.priority >= 3).length;
    document.getElementById('summary-priority').textContent = clusters.filter(c => c.priority >= 4).length;

    // 競合対策サマリー
    const strategyCounts = { S: 0, A: 0, B: 0, C: 0 };
    const layerCounts = { A: 0, B: 0, C: 0 };
    keywords.forEach(kw => {
        if (kw.strategyPriority) strategyCounts[kw.strategyPriority]++;
        if (kw.contentType) layerCounts[kw.contentType]++;
    });

    // 競合対策サマリーが存在すれば更新
    const strategyEl = document.getElementById('strategy-summary');
    if (strategyEl) {
        strategyEl.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div class="bg-white rounded-xl p-3 border-2 ${strategyCounts.S > 0 ? 'border-red-300 bg-red-50' : 'border-gray-200'} text-center shadow-sm">
                    <div class="text-2xl font-bold ${strategyCounts.S > 0 ? 'text-red-600' : 'text-gray-400'}">${strategyCounts.S}</div>
                    <div class="text-[10px] text-gray-500 font-medium">S優先</div>
                    <div class="text-[9px] text-gray-400">ブルーオーシャン</div>
                </div>
                <div class="bg-white rounded-xl p-3 border-2 ${strategyCounts.A > 0 ? 'border-orange-300 bg-orange-50' : 'border-gray-200'} text-center shadow-sm">
                    <div class="text-2xl font-bold ${strategyCounts.A > 0 ? 'text-orange-600' : 'text-gray-400'}">${strategyCounts.A}</div>
                    <div class="text-[10px] text-gray-500 font-medium">A優先</div>
                    <div class="text-[9px] text-gray-400">差別化推奨</div>
                </div>
                <div class="bg-white rounded-xl p-3 border-2 ${layerCounts.B > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'} text-center shadow-sm">
                    <div class="text-2xl font-bold ${layerCounts.B > 0 ? 'text-blue-600' : 'text-gray-400'}">${layerCounts.B}</div>
                    <div class="text-[10px] text-gray-500 font-medium">B層</div>
                    <div class="text-[9px] text-gray-400">業種特化</div>
                </div>
                <div class="bg-white rounded-xl p-3 border-2 ${layerCounts.C > 0 ? 'border-green-300 bg-green-50' : 'border-gray-200'} text-center shadow-sm">
                    <div class="text-2xl font-bold ${layerCounts.C > 0 ? 'text-green-600' : 'text-gray-400'}">${layerCounts.C}</div>
                    <div class="text-[10px] text-gray-500 font-medium">C層</div>
                    <div class="text-[9px] text-gray-400">体験・事例</div>
                </div>
            </div>
            ${strategyCounts.S > 0 || strategyCounts.A > 0 || layerCounts.B > 0 || layerCounts.C > 0 ? `
            <div class="bg-white rounded-lg p-3 border border-indigo-100">
                <div class="flex items-start gap-2">
                    <span class="material-symbols-outlined text-indigo-500" style="font-size:18px;">lightbulb</span>
                    <div class="text-xs text-gray-600">
                        ${strategyCounts.S > 0 ? `<span class="text-red-600 font-bold">S優先が${strategyCounts.S}件</span> → 競合が弱い領域。早急に記事作成を。` : ''}
                        ${strategyCounts.S > 0 && (layerCounts.B + layerCounts.C > 0) ? '<br>' : ''}
                        ${layerCounts.B + layerCounts.C > 0 ? `<span class="text-blue-600 font-medium">B層${layerCounts.B}件・C層${layerCounts.C}件</span>を優先的に作成すると差別化できます。` : ''}
                        ${strategyCounts.S === 0 && layerCounts.B + layerCounts.C === 0 ? 'A層（制度解説系）が中心です。一次情報を追加して差別化しましょう。' : ''}
                    </div>
                </div>
            </div>` : ''}
        `;
    }

    // クラスター一覧
    const clusterList = document.getElementById('cluster-list');
    clusterList.innerHTML = clusters.map((c, idx) => {
        const priorityClass = c.priority >= 4 ? 'priority-badge-high' : c.priority >= 3 ? 'priority-badge-mid' : 'priority-badge-low';
        const borderClass = c.priority >= 4 ? 'border-indigo-300 bg-indigo-50' : c.priority >= 3 ? 'border-indigo-200 bg-slate-50' : 'border-gray-200 bg-gray-50';
        return `
            <div class="cluster-card border-2 ${borderClass} rounded-xl p-4" onclick="selectCluster(${idx})">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-semibold text-gray-800">${c.name}</h4>
                    <span class="${priorityClass} text-white text-xs px-2 py-1 rounded-full">優先度${c.priority}</span>
                </div>
                <div class="text-sm text-gray-600 mb-2">${c.keywords.length}キーワード</div>
                <div class="flex flex-wrap gap-1">
                    ${c.keywords.slice(0, 3).map(k => `<span class="text-xs bg-white px-2 py-1 rounded border">${k.keyword.length > 15 ? k.keyword.slice(0, 15) + '...' : k.keyword}</span>`).join('')}
                    ${c.keywords.length > 3 ? `<span class="text-xs text-gray-400">+${c.keywords.length - 3}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');

    // 優先度TOP20
    const priorityTable = document.getElementById('priority-table');
    priorityTable.innerHTML = keywords.slice(0, 20).map((kw, i) => {
        const sources = getPrimarySources(kw.keyword);
        const sourceLink = sources.length > 0
            ? `<a href="${sources[0].url}" target="_blank" class="text-indigo-600 underline text-xs">参照</a>`
            : '-';
        const intentColor = kw.intent === '購入意向' ? 'text-indigo-700 font-semibold' : kw.intent === '比較検討' ? 'text-indigo-500' : 'text-slate-500';
        const volumeDisplay = kw.volume >= 1000 ? (kw.volume / 1000).toFixed(1) + 'K' : kw.volume;

        // 競合対策表示
        const layerClass = kw.contentType === 'A' ? 'bg-gray-200 text-gray-700' :
                          kw.contentType === 'B' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700';
        const strategyClass = kw.strategyPriority === 'S' ? 'bg-red-500 text-white' :
                             kw.strategyPriority === 'A' ? 'bg-orange-500 text-white' :
                             kw.strategyPriority === 'B' ? 'bg-yellow-400 text-gray-800' :
                             'bg-gray-300 text-gray-600';

        return `
            <tr class="border-b hover:bg-gray-50">
                <td class="p-3 font-bold text-indigo-600">${i + 1}</td>
                <td class="p-3">${kw.keyword}</td>
                <td class="p-3 text-center text-gray-500 text-sm">${volumeDisplay}</td>
                <td class="p-3 text-center"><span class="${layerClass} text-xs px-2 py-0.5 rounded">${kw.contentType}層</span></td>
                <td class="p-3 text-center"><span class="${strategyClass} text-xs px-2 py-0.5 rounded font-bold">${kw.strategyPriority}</span></td>
                <td class="p-3 text-center"><span class="${intentColor} text-xs font-medium">${kw.intent}</span></td>
                <td class="p-3 text-center"><span class="font-semibold">${kw.cvExpect}%</span></td>
                <td class="p-3 text-center">${sourceLink}</td>
            </tr>
        `;
    }).join('');
}

// ========== クラスター選択 ==========
function selectCluster(idx) {
    selectedClusterIndex = idx;
    const cluster = clusters[idx];
    document.getElementById('selected-cluster-name').textContent = `「${cluster.name}」の記事を設計`;
    document.getElementById('article-design-result').classList.add('hidden');
    goToStep(3);
    // 構成作成タブをデフォルトで表示
    showArticleMainTab('design');
}

// ========== 記事設計生成（プロ仕様・実データ活用版） ==========
function generateArticleDesign() {
    if (selectedClusterIndex === null) {
        alert('グループを選択してください');
        return;
    }

    const cluster = clusters[selectedClusterIndex];
    const type = document.querySelector('input[name="article-type"]:checked').value;
    const mainKw = cluster.keywords[0]?.keyword || cluster.name;
    const year = new Date().getFullYear();

    // 競合対策分析（クラスター内のキーワードを分析）
    const clusterStrategyStats = { layers: { A: 0, B: 0, C: 0 }, priorities: { S: 0, A: 0, B: 0, C: 0 } };
    cluster.keywords.forEach(kw => {
        if (kw.contentType) clusterStrategyStats.layers[kw.contentType]++;
        if (kw.strategyPriority) clusterStrategyStats.priorities[kw.strategyPriority]++;
    });
    const dominantLayer = Object.entries(clusterStrategyStats.layers).sort((a, b) => b[1] - a[1])[0]?.[0] || 'A';
    const hasSPriority = clusterStrategyStats.priorities.S > 0;
    const hasAPriority = clusterStrategyStats.priorities.A > 0;
    const mainKwStrategy = cluster.keywords[0] || {};

    // キーワードから教育種別を判定し、マスターデータを取得
    let eduKey = null;
    let eduData = null;

    const eduKeyMapping = [
        { patterns: ['職長'], key: '職長' },
        { patterns: ['フルハーネス'], key: 'フルハーネス' },
        { patterns: ['足場'], key: '足場' },
        { patterns: ['酸欠', '酸素欠乏'], key: '酸欠' },
        { patterns: ['粉じん', '粉塵'], key: '粉じん' },
        { patterns: ['低圧電気', '低圧'], key: '低圧電気' },
        { patterns: ['玉掛け', '玉掛'], key: '玉掛け' },
        { patterns: ['フォークリフト'], key: 'フォークリフト' }
    ];

    for (const mapping of eduKeyMapping) {
        if (mapping.patterns.some(p => mainKw.includes(p))) {
            eduKey = mapping.key;
            eduData = educationMasterData[eduKey];
            break;
        }
    }

    // 実データから各種情報を取得（データがない場合はデフォルト値）
    const eduName = eduData?.name || mainKw;
    const lawRef = eduData?.law || '労働安全衛生法';
    const lawUrl = eduData?.lawUrl || 'https://elaws.e-gov.go.jp/';
    const totalHours = eduData?.totalHours || '○';
    const curriculum = eduData?.curriculum || [];
    const priceOnlineMin = eduData?.priceRange?.online?.min ? eduData.priceRange.online.min.toLocaleString() : '○○○○';
    const priceOnlineMax = eduData?.priceRange?.online?.max ? eduData.priceRange.online.max.toLocaleString() : '○○○○';
    const priceOfflineMin = eduData?.priceRange?.offline?.min ? eduData.priceRange.offline.min.toLocaleString() : '○○○○';
    const priceOfflineMax = eduData?.priceRange?.offline?.max ? eduData.priceRange.offline.max.toLocaleString() : '○○○○';
    const targetPerson = eduData?.targetPerson || '該当する作業に従事する者';
    const industries = eduData?.industries || '建設業など';
    const penalty = eduData?.penalty || '罰則あり';
    const validityPeriod = eduData?.validityPeriod || '法的義務なし';
    const recommendedRefresh = eduData?.recommendedRefresh || '定期的な再教育推奨';
    const onlineAvailable = eduData?.onlineAvailable !== false;
    const practicalRequired = eduData?.practicalRequired || false;
    const practicalNote = eduData?.practicalNote || '';

    // カリキュラムを文字列に変換
    let curriculumText = '';
    let gakkaHours = 0;
    let jitsugiHours = 0;
    if (curriculum.length > 0) {
        curriculum.forEach(c => {
            if (c.subject.includes('実技')) {
                jitsugiHours += c.hours;
            } else {
                gakkaHours += c.hours;
            }
        });
        curriculumText = curriculum.map(c => `- ${c.subject}（${c.hours}時間）`).join('\n');
    }

    // ========== A/B/C層別セクション生成 ==========
    let layerSection = '';
    const layerBadge = dominantLayer === 'A' ? '【A層：制度解説】' :
                       dominantLayer === 'B' ? '【B層：業種特化】' : '【C層：体験・事例】';

    if (dominantLayer === 'A') {
        // A層：制度解説系 - 法令根拠・数字を強調
        layerSection = `
## 【差別化セクション】法令根拠と実務のポイント

### 関連法令の条文
- ${lawRef}
- 労働安全衛生規則 第○条（該当条文を追記）
- 参照：[e-Gov法令検索](${lawUrl})

### 実務で押さえるべき数字
| 項目 | 内容 |
|------|------|
| 講習時間 | ${totalHours}時間 |
| 料金相場 | ${priceOnlineMin}円〜${priceOfflineMax}円 |
| 有効期限 | ${validityPeriod} |
| 罰則 | ${penalty} |

### 現場担当者からのアドバイス
※E-E-A-T強化※
「現場では○○という点が見落とされがちです」
「実務上、○○の場合は△△に注意が必要です」
→ 実際の経験に基づくアドバイスを追記`;
    } else if (dominantLayer === 'B') {
        // B層：業種特化系 - 業種別の具体例
        const targetIndustry = mainKwStrategy.targetIndustry || '建設業';
        layerSection = `
## 【差別化セクション】${targetIndustry}における${eduName}

### ${targetIndustry}特有の受講シーン
- ${targetIndustry}の現場では○○の作業で必要になります
- 特に△△の工程で重要です
- □□業界との違いは～

### ${targetIndustry}の事例
**事例1：○○会社の場合**
- 導入の背景：
- 受講した結果：
- 担当者のコメント：

**事例2：△△現場での活用**
- 状況：
- 効果：

### ${targetIndustry}向けの受講アドバイス
- ${targetIndustry}で働く方は○○を意識すると良い
- 繁忙期を避けて△△の時期に受講がおすすめ
- 複数名まとめて出張講習も検討を

[画像：${targetIndustry}の現場での講習風景]`;
    } else if (dominantLayer === 'C') {
        // C層：体験・事例系 - 一次情報を強調
        layerSection = `
## 【差別化セクション】実際に受講した人の体験談

### 受講者インタビュー
**Aさん（${industries}勤務・30代）**
> 「実際に受講してみて、○○が一番勉強になりました。講師の方が現場経験豊富で、教科書には載っていない△△の話が聞けたのが良かったです。」

**Bさん（現場監督・40代）**
> 「部下に受講させる前に自分で受けてみました。□□の部分は普段の作業でも見落としがちだったので、チーム全体で共有しました。」

### 受講レポート：私が体験した${eduName}

#### 申し込みから受講まで
1. Webで申し込み（所要時間：約5分）
2. テキストが届く（申込から3日後）
3. 受講当日の流れ

#### 講習の様子
- 会場/オンラインの雰囲気
- 他の受講者の様子（年齢層、業種など）
- 講師の教え方

[画像：実際の講習風景]
[画像：使用したテキスト]
[画像：取得した修了証]

#### 正直な感想
- 良かった点：
- 改善してほしい点：
- これから受講する人へのアドバイス：

### よくある失敗談と対策
- 「○○を忘れて焦った」→ 事前に△△を確認
- 「□□で躓いた」→ 予習しておくとスムーズ`;
    }

    // 構成案・タイトル・メタを記事タイプ別に生成
    let outline = '';
    let titles = [];
    let metaDesc = '';
    let ctaGuide = '';
    let internalLinks = '';
    let schemaMarkup = '';
    let eeaTips = '';
    let aiDiffTips = '';

    // KCI教育センターの講座URLを取得
    const courseUrl = kciSiteInfo.courses[eduKey]?.page || kciSiteInfo.pages.courseInfo;

    if (type === 'pillar') {
        // =============================================
        // ピラー記事：網羅的な総合ガイド（実データ反映版）
        // =============================================
        outline = `# ${eduName}完全ガイド【${year}年最新版】

## ${eduName}とは？基本と法的根拠
${eduName}は、${lawRef}に基づき、${targetPerson}に対して義務付けられている教育です。

【この記事の信頼性】
※E-E-A-T強化ポイント※
- 執筆者情報を記載（例：「○○資格保有、現場経験○年の安全管理者が監修」）
- 参照法令へのリンクを明記
- 最終更新日を表示

### なぜ${eduName}が必要なのか
- 法的義務：${lawRef}
- 罰則：${penalty}
- 対象業種：${industries}

【CTA挿入ポイント①】
「今すぐ受講したい方はこちら」ボタン

## ${eduName}の受講対象者
### 受講が義務付けられている人
${targetPerson}

### 受講資格・条件
- 特別な資格は不要
- 年齢制限なし（実務経験も問われない）

【内部リンク①】
→「○○との違いを知りたい方はこちら」

## ${eduName}のカリキュラム・講習内容【全${totalHours}時間】
${gakkaHours > 0 ? `### 学科講習（${gakkaHours}時間）` : '### 講習科目'}
${curriculumText || '- 詳細カリキュラムは講座により異なります'}

${practicalRequired ? `### 実技講習（${jitsugiHours}時間）
${practicalNote ? `※注意：${practicalNote}` : '実技講習は対面で実施'}` : ''}

【差別化ポイント】
※現場経験に基づく具体例を追加※
「実際の講習では○○のような事例を学びます」

## ${eduName}の受講方法を比較
### オンライン講座
${onlineAvailable ? `- 受講可能
- メリット：場所を選ばない、費用が安い
- デメリット：${practicalRequired ? '実技は別途対面が必要' : '質問がしにくい場合がある'}` : '- オンライン受講不可（技能講習のため全課程対面必須）'}

### 対面講座
- 費用相場：${priceOfflineMin}円〜${priceOfflineMax}円
- メリット：実技もまとめて受講可能、その場で質問できる
- デメリット：会場まで行く必要がある

### 出張講習
- 10名以上の企業におすすめ
- 費用は要見積もり

【CTA挿入ポイント②】
オンライン・対面それぞれの申込ボタン

## ${eduName}の費用・料金相場【${year}年最新】
### 受講料の目安
${onlineAvailable ? `| 受講形式 | 料金相場 |
|---------|---------|
| オンライン | ${priceOnlineMin}円〜${priceOnlineMax}円 |
| 対面講座 | ${priceOfflineMin}円〜${priceOfflineMax}円 |` : `| 受講形式 | 料金相場 |
|---------|---------|
| 対面講座 | ${priceOfflineMin}円〜${priceOfflineMax}円 |`}

### 人材開発支援助成金の活用
- 条件を満たせば受講料の一部が助成
- 申請方法は厚生労働省サイトを参照

【内部リンク②】
→「助成金の詳しい申請方法はこちら」

## 修了証について
### 有効期限
${validityPeriod}

### 再教育（能力向上教育）
${recommendedRefresh}

### 修了証の再発行
受講した機関に連絡すれば可能（手数料が発生する場合あり）
${layerSection}

## よくある質問
### Q. ${eduName}を受講しないとどうなる？
A. 事業者に対して${penalty}が科される可能性があります。

### Q. 最短何日で取得できる？
A. ${onlineAvailable ? 'オンライン講座なら最短1〜2日で修了可能です。' : `講習時間は合計${totalHours}時間のため、通常2〜4日かかります。`}

### Q. 修了試験はありますか？
A. 多くの講座では理解度確認テストがありますが、事前に学習すれば問題ありません。

## まとめ：${eduName}を受講するなら

【CTA挿入ポイント③】最終CTA
- 「当社のオンライン講座はこちら」
- 受講料、所要時間、特徴を再掲`;

        titles = [
            `【${year}年版】${eduName}とは？対象者・内容・費用${priceOnlineMin ? '（' + priceOnlineMin + '円〜）' : ''}を完全解説`,
            `${eduName}完全ガイド｜全${totalHours}時間のカリキュラムから料金相場まで`,
            `${eduName}の全知識｜${lawRef}の義務・対象者・費用【${year}年最新】`
        ];
        metaDesc = `${eduName}を徹底解説。${targetPerson}が対象。講習時間は全${totalHours}時間、費用相場は${onlineAvailable ? priceOnlineMin + '円〜' + priceOnlineMax + '円（オンライン）' : priceOfflineMin + '円〜' + priceOfflineMax + '円'}。${lawRef}に基づく法的義務から修了証の有効期限まで網羅。`;

        // E-E-A-T強化ガイド
        eeaTips = `【E-E-A-T強化チェックリスト】
□ 執筆者プロフィールを記載（資格・経験年数）
□ 監修者情報を追加（可能であれば顔写真も）
□ 参照した法令・公的資料のリンクを明記
□ 最終更新日を表示
□ 現場での実体験に基づくエピソードを追加
□ 具体的な数字（${totalHours}時間、${priceOnlineMin}円〜など）を使用`;

        // CTA設計ガイド（KCI教育センター用）
        ctaGuide = `【CTA設計ガイド - KCI教育センター】
1. リード文直後（ファーストビュー）
   → 「KCI教育センターで${eduName}を受講する」ボタン
   → リンク先：${courseUrl}

2. 受講方法セクション
   → 「eラーニング講座を見る」リンク
   → リンク先：${kciSiteInfo.pages.elearning}
   → 「ZOOM講習の詳細」リンク
   → リンク先：${kciSiteInfo.pages.online}

3. 費用セクション
   → 「KCI教育センターの料金を確認」ボタン
   → リンク先：${courseUrl}
   → 「助成金活用ガイド」内部リンク

4. まとめセクション（最重要）
   → メインCTA：「今すぐ申し込む」
   → リンク先：${kciSiteInfo.pages.application}
   → サブCTA：「講座一覧を見る」
   → リンク先：${kciSiteInfo.pages.courseInfo}

【KCI教育センターの強み（CTA訴求ポイント）】
✓ ${kciSiteInfo.features.join('\n✓ ')}`;

        // 内部リンク設計（KCI教育センター用）
        internalLinks = `【内部リンク設計 - KCI教育センター】
■ このピラー記事からリンクすべきページ：

【サービスページへの内部リンク】
- 講座申込ページ → ${kciSiteInfo.pages.application}
- eラーニング講座一覧 → ${kciSiteInfo.pages.elearning}
- オンライン講座（ZOOM） → ${kciSiteInfo.pages.online}
- ${eduName}詳細ページ → ${courseUrl}

【関連記事へのリンク（トピッククラスター）】
- 「${eduName}の費用・料金」詳細記事
- 「${eduName}のカリキュラム」詳細記事
- 「${eduName} オンライン おすすめ」記事
- 「${eduName}と○○の違い」比較記事
- 「${eduName} よくある質問」記事

【逆リンク設計】
上記すべての関連記事から、このピラー記事（${eduName}完全ガイド）へリンクを設置

【サイト回遊導線】
記事下部に「関連する講座」として他の教育種別へのリンクを設置：
- 職長教育 → ${kciSiteInfo.pages.shokucho}
- 講座一覧 → ${kciSiteInfo.pages.courseInfo}`;

        // 構造化データ
        schemaMarkup = `【構造化データ（FAQPage Schema）】
よくある質問セクションに以下のJSON-LDを実装：

&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "${eduName}を受講しないとどうなる？",
      "acceptedAnswer": {
"@type": "Answer",
"text": "事業者に対して${penalty}が科される可能性があります。"
      }
    },
    {
      "@type": "Question",
      "name": "${eduName}は最短何日で取得できる？",
      "acceptedAnswer": {
"@type": "Answer",
"text": "${onlineAvailable ? 'オンライン講座なら最短1〜2日で修了可能です。' : '講習時間は合計' + totalHours + '時間のため、通常2〜4日かかります。'}"
      }
    }
  ]
}
&lt;/script&gt;`;

        // AI記事との差別化
        aiDiffTips = `【AI記事との差別化ポイント】
□ 現場でよくある失敗事例を追加（実体験ベース）
□ 「受講者の声」を掲載（実在の受講者から取材）
□ 写真・図解を追加（オリジナルの講習風景など）
□ 地域別の講習会場情報を追加
□ 最新の法改正情報を反映（${year}年時点）
□ 「○○の場合はどうする？」ニッチな疑問に回答
□ 比較表にオリジナルの評価軸を追加`;

    } else if (type === 'howto') {
        // =============================================
        // ハウツー記事：手順・方法にフォーカス（実データ反映版）
        // =============================================
        outline = `# ${eduName}の受け方｜申し込みから修了証取得までの全手順【${year}年】

## この記事で分かること
- ${eduName}の申し込み方法
- 受講当日の流れ（全${totalHours}時間）
- 修了証の受け取り方

【執筆者情報】
※E-E-A-T：実際に受講した経験者または講師が執筆していることを明記※

【CTA挿入ポイント①】
「今すぐ申し込む方はこちら」

## 【前提知識】${eduName}とは
${eduName}は${lawRef}に基づく法定教育です。
${targetPerson}は必ず受講が必要です。

【内部リンク】→ 詳しくは「${eduName}完全ガイド」へ

## ${eduName}を受講する5つのステップ

### STEP1：受講する講座を選ぶ
#### オンライン講座を選ぶ場合（${onlineAvailable ? '受講可' : '受講不可'}）
${onlineAvailable ? `- 料金相場：${priceOnlineMin}円〜${priceOnlineMax}円
- 選ぶポイント：修了証即日発行、サポート体制
${practicalRequired ? `- 注意：${practicalNote}` : ''}` : '- この教育はオンライン受講ができません'}

#### 対面講座を選ぶ場合
- 料金相場：${priceOfflineMin}円〜${priceOfflineMax}円
- 選ぶポイント：会場のアクセス、日程の豊富さ

【差別化】講座選びの失敗談と対策を追加

### STEP2：申し込み手続きをする
- 必要な情報：氏名、生年月日、勤務先、連絡先
- 支払い方法：クレジットカード、銀行振込、請求書払い
- 申し込みから受講までの期間：通常1週間程度

【CTA挿入ポイント②】
「当社の講座はWebから簡単申込」

### STEP3：受講準備をする
- 届くもの：テキスト（事前送付の場合）、受講票、請求書
- 用意するもの：筆記用具、身分証明書（顔写真付き）
${onlineAvailable ? '- オンラインの場合：PC/タブレット、安定したネット環境' : ''}

### STEP4：講習を受講する（全${totalHours}時間）
#### 当日のスケジュール例
${curriculum.length > 0 ? curriculum.map(c => `- ${c.subject}：${c.hours}時間`).join('\n') : '- 学科講習\n- 理解度テスト'}

#### 遅刻・欠席した場合
- 遅刻：振替受講が必要になる場合あり
- 欠席：事前連絡で日程変更可能（講座による）

#### 修了試験について
- 形式：選択式または○×式が多い
- 合格率：事前学習すればほぼ100%

【差別化】実際の講習で「ここがポイント」になる部分を追加

### STEP5：修了証を受け取る
- 即日発行：オンライン講座の多くは対応
- 後日郵送：対面講座は1〜2週間後が多い
- 届かない場合：受講した機関に連絡

## 受講時の注意点・よくある失敗
${practicalRequired ? `- 実技講習を忘れずに：${practicalNote}` : ''}
- 身分証明書を忘れると受講できない場合あり
- オンラインは途中離席するとやり直しになることも
${layerSection}

## まとめ：${eduName}受講の流れ
1. 講座を選ぶ
2. 申し込み
3. 事前準備
4. 受講（${totalHours}時間）
5. 修了証取得

【CTA挿入ポイント③】最終CTA
「当社のオンライン講座なら最短○日で修了証取得」`;

        titles = [
            `${eduName}の受け方｜申し込みから修了証取得まで5ステップ【全${totalHours}時間】`,
            `【初心者向け】${eduName}の受講手順を徹底ガイド【${year}年版】`,
            `${eduName}はどうやって受ける？費用${priceOnlineMin}円〜の申し込み方法を解説`
        ];
        metaDesc = `${eduName}の受講方法を5ステップで解説。講習時間は全${totalHours}時間、費用は${onlineAvailable ? priceOnlineMin + '円〜' : priceOfflineMin + '円〜'}。講座の選び方から修了証取得まで、初めての方にも分かりやすく説明します。`;

        eeaTips = `【E-E-A-T強化チェックリスト】
□ 実際に受講した経験を記載（受講日、会場など）
□ 講習当日の写真を追加（可能であれば）
□ 「私が受講したときは○○でした」という一人称の体験談
□ 具体的な時間・費用の数字を使用`;

        ctaGuide = `【CTA設計ガイド - KCI教育センター】
1. 冒頭（前提知識セクション後）
   → 「KCI教育センターの講座を見る」ボタン
   → リンク先：${courseUrl}

2. STEP1（講座を選ぶ）
   → 「eラーニング講座を見る」→ ${kciSiteInfo.pages.elearning}
   → 「ZOOM講習を見る」→ ${kciSiteInfo.pages.online}

3. STEP2（申し込み手続き）
   → 「KCI教育センターで申し込む」ボタン
   → リンク先：${kciSiteInfo.pages.application}

4. まとめセクション
   → メインCTA：「KCI教育センターで受講する」
   → リンク先：${kciSiteInfo.pages.application}

【KCI教育センターの特徴を訴求】
- 顔認証付きeラーニングで24時間受講可能
- 最短1日で修了証発行`;

        internalLinks = `【内部リンク設計 - KCI教育センター】
【サービスページへのリンク】
- 講座申込ページ → ${kciSiteInfo.pages.application}
- ${eduName}講座ページ → ${courseUrl}
- eラーニング一覧 → ${kciSiteInfo.pages.elearning}

【関連記事へのリンク】
- 「${eduName}完全ガイド」へリンク
- 「${eduName}の費用・料金」記事へリンク
- 「${eduName}おすすめ講座」記事へリンク`;

        schemaMarkup = `【構造化データ（HowTo Schema）】
&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "${eduName}の受け方",
  "totalTime": "PT${totalHours}H",
  "step": [
    {"@type": "HowToStep", "name": "講座を選ぶ", "text": "オンラインまたは対面講座を選択"},
    {"@type": "HowToStep", "name": "申し込み", "text": "必要事項を入力して申込"},
    {"@type": "HowToStep", "name": "受講準備", "text": "テキストと身分証明書を用意"},
    {"@type": "HowToStep", "name": "受講", "text": "全${totalHours}時間の講習を受講"},
    {"@type": "HowToStep", "name": "修了証取得", "text": "修了証を受け取る"}
  ]
}
&lt;/script&gt;`;

        aiDiffTips = `【AI記事との差別化ポイント】
□ 実際の申込画面のスクリーンショットを追加
□ 講習当日の持ち物リスト（写真付き）
□ 「私が受講したときの失敗談」を追加
□ 講習会場の雰囲気を伝える写真
□ 実際の修了証の画像（個人情報は隠す）`;

    } else if (type === 'comparison') {
        // =============================================
        // 講座の選び方＋自社紹介記事（ランキングなし）
        // =============================================
        outline = `# ${eduName}の講座の選び方｜失敗しない3つのポイント【${year}年版】

【この記事の信頼性】
※E-E-A-T：安全教育の専門機関として、講座選びのポイントを解説※

## ${eduName}講座を選ぶ3つのポイント

### ポイント1：受講形式で選ぶ
${onlineAvailable ? `■ オンライン講座（eラーニング・ZOOM）
- メリット：時間・場所を選ばない、費用${priceOnlineMin}円〜
- デメリット：自己管理が必要
${practicalRequired ? `- 注意点：${practicalNote}` : ''}

■ 対面講座
- メリット：実技もまとめて受講可能、講師に直接質問できる
- デメリット：日程・場所の制約あり
- 費用相場：${priceOfflineMin}円〜${priceOfflineMax}円` : `この講習は技能講習のため、対面での受講が必要です。
- 費用相場：${priceOfflineMin}円〜${priceOfflineMax}円`}

### ポイント2：料金だけで選ばない
- オンライン相場：${onlineAvailable ? `${priceOnlineMin}円〜${priceOnlineMax}円` : '対応講座なし'}
- 対面相場：${priceOfflineMin}円〜${priceOfflineMax}円

料金以外にチェックすべき点：
- 修了証の発行スピード
- サポート体制（質問対応など）
- 不正受講防止の仕組み（企業として重要）

### ポイント3：信頼性・コンプライアンスで選ぶ
- 修了証が正式に発行されるか
- 受講記録が適切に管理されているか
- 不正受講を防止する仕組みがあるか

【CTA挿入ポイント①】
「講座を探している方はこちら」

## KCI教育センターの${eduName}講座

当センターでは、以下の特徴で${eduName}を提供しています。

### 受講形式
${onlineAvailable ? `- eラーニング（顔認証付き）：24時間いつでも受講可能
- ZOOM講習：リアルタイムで講師とやり取り
- 対面講習：全国の会場で開催` : `- 対面講習：全国の会場で開催`}

### 講習時間
- 全${totalHours}時間

### KCI教育センターの5つの特徴

**1. 顔認証付きeラーニング**
不正受講を防止し、企業のコンプライアンスをサポート。
労働基準監督署の調査にも安心して対応できます。

**2. 最短1日で修了証発行**
急ぎで資格が必要な方にも対応。
eラーニングなら受講完了後すぐに修了証をダウンロード可能。

**3. 土日も開催**
平日は現場で忙しい方も、土日に受講できます。

**4. 全国対応**
eラーニング・ZOOMなら全国どこからでも受講可能。
対面講習も各地で開催しています。

**5. 充実のサポート体制**
受講中の質問対応、修了証の再発行など、受講後もサポート。

【CTA挿入ポイント②】
「KCI教育センターの講座を見る」→ ${courseUrl}

## こんな方におすすめ

- 忙しくて講習会場に行く時間がない方
- すぐに修了証が必要な方
- 企業としてコンプライアンスを重視している方
- 複数名の社員をまとめて受講させたい方

【内部リンク】
→「${eduName}とは？基礎知識を確認する」
${layerSection}

## まとめ

${eduName}の講座を選ぶ際は、料金だけでなく「受講形式」「信頼性」「サポート体制」も重要です。

KCI教育センターでは：
- 顔認証付きeラーニングで不正受講を防止
- 最短1日で修了証発行
- 土日も開催、全国対応

【CTA挿入ポイント③】最終CTA
「${eduName}の講座を見る」→ ${courseUrl}
「今すぐ申し込む」→ ${kciSiteInfo.pages.application}`;

        titles = [
            `${eduName}の講座の選び方｜失敗しない3つのポイント【${year}年版】`,
            `${eduName}はどこで受ける？講座選びのコツと料金相場を解説`,
            `【${year}年】${eduName}講座の選び方ガイド｜受講形式・費用・サポートで比較`
        ];
        metaDesc = `${eduName}の講座選びで失敗しないためのポイントを解説。受講形式（eラーニング・ZOOM・対面）、料金相場${onlineAvailable ? priceOnlineMin + '円〜' : priceOfflineMin + '円〜'}、サポート体制など、チェックすべき項目を詳しく紹介します。`;

        eeaTips = `【E-E-A-T強化チェックリスト】
□ 安全教育の専門機関としての立場を明記
□ 選び方のポイントに具体的な理由を記載
□ 料金は税込/税抜を明記
□ 各受講形式のメリット・デメリットを公平に記載
□ 実際の受講者の声を追加（可能であれば）`;

        ctaGuide = `【CTA設計ガイド - KCI教育センター】
1. 選び方セクション後
   → 「講座を探している方はこちら」ボタン
   → リンク先：${kciSiteInfo.pages.courseInfo}

2. KCI教育センター紹介セクション
   → 「講座の詳細を見る」ボタン
   → リンク先：${courseUrl}

3. まとめセクション
   → メインCTA：「${eduName}の講座を見る」
   → リンク先：${courseUrl}
   → サブCTA：「今すぐ申し込む」
   → リンク先：${kciSiteInfo.pages.application}`;

        internalLinks = `【内部リンク設計 - KCI教育センター】
【サービスページへのリンク】
- 講座申込ページ → ${kciSiteInfo.pages.application}
- ${eduName}講座ページ → ${courseUrl}
- eラーニング講座一覧 → ${kciSiteInfo.pages.elearning}

【関連記事へのリンク】
- 「${eduName}完全ガイド」ピラー記事へリンク
- 「${eduName}の費用・料金」詳細記事へリンク`;

        schemaMarkup = `【構造化データ（Article Schema）】
&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${eduName}の講座の選び方｜失敗しない3つのポイント",
  "author": {
    "@type": "Organization",
    "name": "KCI教育センター",
    "url": "${kciSiteInfo.pages.top}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "KCI教育センター"
  }
}
&lt;/script&gt;`;

        aiDiffTips = `【AI記事との差別化ポイント】
□ 自社の講座運営経験に基づく選び方のアドバイス
□ 講座の申込画面・受講画面のスクリーンショット
□ 実際に受講した人のインタビュー・感想
□ 「○○な人にはこの受講形式がおすすめ」具体的なペルソナ別提案
□ 不正受講防止の重要性など、企業目線の情報を追加`;

    } else if (type === 'faq') {
        // =============================================
        // FAQ記事：Q&A形式（実データ反映版）
        // =============================================
        outline = `# ${eduName}のよくある質問｜費用・時間・オンラインの疑問を解決【${year}年】

【この記事の信頼性】
※E-E-A-T：${lawRef}に基づく正確な情報、講師経験者が回答※

## ${eduName}の基本に関する質問

### Q1. ${eduName}とは何ですか？
A. ${eduName}は、${lawRef}に基づき、${targetPerson}に対して義務付けられている法定教育です。対象業種は${industries}などです。

### Q2. ${eduName}は誰が受講する必要がありますか？
A. ${targetPerson}は受講が必要です。
具体例：
- ○○の作業に従事する方
- ○○を行う現場の作業員

### Q3. ${eduName}を受講しないとどうなりますか？
A. 事業者に対して${penalty}が科される可能性があります。また、無資格者による作業は労災事故発生時に重大な問題となります。

【CTA挿入ポイント①】
「今すぐ受講する」ボタン

## 受講方法に関する質問

### Q4. ${eduName}はオンラインで受講できますか？
A. ${onlineAvailable ? `はい、オンラインで受講可能です。${practicalRequired ? `ただし、${practicalNote}` : '学科講習はすべてオンラインで完結します。'}` : 'いいえ、この講習は技能講習のため、全課程対面での受講が必要です。'}

### Q5. ${eduName}の講習時間はどのくらいですか？
A. 合計${totalHours}時間です。
${curriculum.length > 0 ? curriculum.map(c => `- ${c.subject}：${c.hours}時間`).join('\n') : '詳細なカリキュラムは講座により異なります。'}

### Q6. 最短何日で修了証を取得できますか？
A. ${onlineAvailable ? `オンライン講座なら最短1〜2日で修了証取得可能です。即日発行に対応している講座もあります。` : `講習時間は合計${totalHours}時間のため、通常2〜4日かかります。`}

## 費用に関する質問

### Q7. ${eduName}の受講料はいくらですか？
A. 受講形式により異なります。
${onlineAvailable ? `- オンライン：${priceOnlineMin}円〜${priceOnlineMax}円
- 対面講座：${priceOfflineMin}円〜${priceOfflineMax}円` : `- 対面講座：${priceOfflineMin}円〜${priceOfflineMax}円`}

### Q8. 助成金は使えますか？
A. 人材開発支援助成金の対象です。条件を満たせば受講料の一部（最大75%）が助成されます。詳しくは厚生労働省サイトをご確認ください。

【内部リンク】→「助成金の申請方法はこちら」

## 修了証に関する質問

### Q9. 修了証に有効期限はありますか？
A. ${validityPeriod}。ただし、${recommendedRefresh}。

### Q10. 修了証を紛失した場合は再発行できますか？
A. はい、受講した機関に連絡すれば再発行可能です（手数料1,000〜3,000円程度）。

## その他の質問

### Q11. 他の教育との違いは？
A. ${eduKey === '職長' ? '職長教育は現場監督者向け、特別教育は作業者向けという違いがあります。' : '詳細は関連記事をご確認ください。'}

【内部リンク】→「${eduName}と○○の違いを解説」

### Q12. 試験に落ちることはありますか？
A. 修了試験は理解度確認が目的のため、講習内容を理解していれば問題ありません。万が一不合格でも、再テストを受けられる講座がほとんどです。
${layerSection}

## まとめ
${eduName}についてよくある質問に回答しました。
- 対象者：${targetPerson}
- 講習時間：${totalHours}時間
- 費用：${onlineAvailable ? priceOnlineMin + '円〜' : priceOfflineMin + '円〜'}

【CTA挿入ポイント②】最終CTA
「${eduName}を受講する」ボタン`;

        titles = [
            `${eduName}のよくある質問｜費用${onlineAvailable ? priceOnlineMin + '円〜' : priceOfflineMin + '円〜'}・時間${totalHours}時間の疑問を解決`,
            `【Q&A】${eduName}の疑問12選｜${lawRef}の義務から受講方法まで`,
            `${eduName}FAQ｜費用・有効期限・オンライン受講の疑問に全回答【${year}年】`
        ];
        metaDesc = `${eduName}に関するよくある質問に回答。費用相場${onlineAvailable ? priceOnlineMin + '円〜' + priceOnlineMax + '円' : priceOfflineMin + '円〜' + priceOfflineMax + '円'}、講習時間${totalHours}時間、オンライン受講${onlineAvailable ? '可' : '不可'}など。${lawRef}に基づく正確な情報でお答えします。`;

        eeaTips = `【E-E-A-T強化チェックリスト】
□ 法令の正確な条文番号を記載
□ 回答の根拠（厚生労働省サイトなど）へリンク
□ 「よくある誤解」を正す内容を追加
□ 回答者のプロフィール（講師経験など）を明記`;

        ctaGuide = `【CTA設計ガイド - KCI教育センター】
1. Q3（受講しないとどうなる？）の後
   → 「KCI教育センターで今すぐ受講する」ボタン
   → リンク先：${kciSiteInfo.pages.application}

2. Q4（オンラインで受講できる？）の後
   → 「顔認証付きeラーニングを見る」ボタン
   → リンク先：${kciSiteInfo.pages.elearning}

3. Q7（費用）の後
   → 「KCI教育センターの料金を確認」ボタン
   → リンク先：${courseUrl}

4. まとめセクション
   → メインCTA：「KCI教育センターで${eduName}を受講する」
   → リンク先：${kciSiteInfo.pages.application}

【回答で訴求できるKCIの強み】
- Q4回答内：「KCI教育センターでは顔認証付きeラーニングで24時間受講可能」
- Q6回答内：「KCI教育センターなら最短1日で修了証発行」
- Q8回答内：「助成金申請のサポートもあり」`;

        internalLinks = `【内部リンク設計 - KCI教育センター】
【サービスページへのリンク】
- 講座申込ページ → ${kciSiteInfo.pages.application}
- ${eduName}講座ページ → ${courseUrl}
- eラーニング一覧 → ${kciSiteInfo.pages.elearning}
- ZOOM講習 → ${kciSiteInfo.pages.online}

【関連記事へのリンク】
- 「${eduName}完全ガイド」へリンク
- 「${eduName}の費用・料金」詳細記事へリンク
- 「${eduName}おすすめ講座」記事へリンク
- 「${eduName}と○○の違い」記事へリンク`;

        schemaMarkup = `【構造化データ（FAQPage Schema）】
&lt;script type="application/ld+json"&gt;
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "${eduName}とは何ですか？",
      "acceptedAnswer": {
"@type": "Answer",
"text": "${eduName}は、${lawRef}に基づき、${targetPerson}に対して義務付けられている法定教育です。"
      }
    },
    {
      "@type": "Question",
      "name": "${eduName}の講習時間はどのくらいですか？",
      "acceptedAnswer": {
"@type": "Answer",
"text": "合計${totalHours}時間です。"
      }
    },
    {
      "@type": "Question",
      "name": "${eduName}の受講料はいくらですか？",
      "acceptedAnswer": {
"@type": "Answer",
"text": "${onlineAvailable ? 'オンライン：' + priceOnlineMin + '円〜' + priceOnlineMax + '円、対面：' + priceOfflineMin + '円〜' + priceOfflineMax + '円' : '対面講座：' + priceOfflineMin + '円〜' + priceOfflineMax + '円'}"
      }
    },
    {
      "@type": "Question",
      "name": "修了証に有効期限はありますか？",
      "acceptedAnswer": {
"@type": "Answer",
"text": "${validityPeriod}。ただし、${recommendedRefresh}。"
      }
    }
  ]
}
&lt;/script&gt;`;

        aiDiffTips = `【AI記事との差別化ポイント】
□ 実際の受講者から寄せられた質問を追加
□ 「現場でよく聞かれる質問」セクションを追加
□ 回答に具体的な事例・エピソードを含める
□ 法改正による最新情報を反映（更新日を明記）`;

    } else if (type === 'case') {
        // =============================================
        // 事例・体験談記事：E-E-A-T強化用
        // =============================================
        outline = `# ${eduName}の受講体験談｜実際に受講した感想と学んだこと【${year}年】

【この記事のポイント】
※実体験に基づくE-E-A-T最強コンテンツ※
- 実際の受講者の声を掲載
- 現場での活用事例を紹介
- 受講前後の変化を具体的に記載

## ${eduName}を受講したきっかけ
### 受講前の状況
- どんな課題があったか
- なぜ受講が必要になったか
- 会社からの指示？自主的？

### ${eduName}を選んだ理由
- オンライン/対面どちらを選んだか
- 受講機関を選んだポイント
- 費用・時間・場所の条件

【CTA挿入ポイント①】
「私も${eduName}を受講する」ボタン

## 実際の講習内容と感想
### 講習の流れ
1. 受講申込（所要時間：約○分）
2. 教材・ログイン情報の受け取り
3. 講習受講（合計${totalHours}時間）
4. 修了試験
5. 修了証の発行

### 印象に残った講習内容
${curriculum.length > 0 ? curriculum.slice(0, 3).map(c => `- ${c.subject}：「○○が印象的だった」`).join('\n') : '- 具体的な事例が多く分かりやすかった'}

### 講習の難易度
- 予習は必要？→○○
- 試験の難しさ→○○
- 合格率の体感→○○

【写真・スクリーンショット挿入】
受講画面や修了証の写真（個人情報に注意）

## 現場での活用事例
### 受講後に変わったこと
- 安全意識の向上
- 作業手順の見直し
- 同僚への指導

### 実際に役立った場面
「○○の現場で△△を判断する際に、講習で学んだ□□の知識が役立った」

【内部リンク】
→「${eduName}の詳しいカリキュラムはこちら」

## 受講を検討している方へのアドバイス
### おすすめの受講形式
- ${onlineAvailable ? 'オンライン受講がおすすめな人：忙しい人、遠方の人' : '対面受講が基本です'}
- 対面受講がおすすめな人：実技をしっかり学びたい人

### 受講前に準備しておくこと
- ○○を確認しておく
- △△を用意しておく

### 費用を抑えるコツ
- 人材開発支援助成金の活用
- 会社負担で受講

【CTA挿入ポイント②】最終CTA
「${eduName}を受講する」ボタン
${layerSection}

## まとめ：${eduName}を受講した感想
${eduName}を受講して、○○が一番の収穫でした。
特に現場で○○する際に、学んだ知識が役立っています。
これから受講する方は、○○に注意して取り組んでください。`;

        titles = [
            `【体験談】${eduName}を受講した感想｜現場で役立った知識とは`,
            `${eduName}受講レポート｜実際の講習内容と活用事例【${year}年】`,
            `${eduName}を受講してみた｜難易度・所要時間・費用のリアルな感想`
        ];
        metaDesc = `${eduName}を実際に受講した体験談。講習内容、難易度、かかった費用、現場での活用事例を紹介。受講を検討中の方へのアドバイスも。`;

        eeaTips = `【E-E-A-T強化チェックリスト】
□ 実際の受講者情報（業種・経験年数など）を明記
□ 修了証の写真（個人情報は隠す）を掲載
□ 具体的な日時・場所・費用を記載
□ 受講前後のBefore/Afterを明確に
□ ネガティブな点も正直に記載（信頼性向上）`;

        ctaGuide = `【CTA設計ガイド - KCI教育センター】
1. 受講のきっかけセクション後
   → 「KCI教育センターで受講する」ボタン
   → リンク先：${courseUrl}

2. 講習内容セクション内
   → 「顔認証付きeラーニングを見る」ボタン
   → リンク先：${kciSiteInfo.pages.elearning}

3. まとめセクション
   → メインCTA：「私も${eduName}を受講する」
   → リンク先：${kciSiteInfo.pages.application}

【体験談で訴求できるKCIの強み】
- 「KCI教育センターで受講して○○が良かった」という具体的な体験
- 顔認証システムの使いやすさ
- サポート対応の良さ
- 修了証発行の速さ`;

        internalLinks = `【内部リンク設計】
【サービスページへのリンク】
- 「${eduName}の詳細・申込」→ ${courseUrl}
- 「他の受講者の声」→ 別の体験談記事
- 「${eduName}とは」→ ピラー記事
- 「よくある質問」→ FAQ記事`;

        aiDiffTips = `【AI記事との差別化ポイント】
□ 実際の受講体験に基づく一次情報
□ 受講画面・修了証の実物写真
□ 具体的な数字（費用○円、時間○分）
□ 失敗談・反省点も正直に記載
□ 現場での具体的な活用エピソード`;

    } else if (type === 'glossary') {
        // =============================================
        // 用語解説記事：「〇〇とは」系
        // =============================================
        outline = `# ${eduName}とは？基本から分かりやすく解説【${year}年版】

【この記事で分かること】
- ${eduName}の定義と目的
- 法律上の根拠と義務
- 受講対象者と受講方法

## ${eduName}とは
${eduName}とは、${lawRef}に基づき実施される法定教育です。
${targetPerson}に対して、○○に関する知識と技能を身につけさせることを目的としています。

### 一言でいうと
「○○の作業を行う人が、安全に作業するために受ける教育」です。

【CTA挿入ポイント①】
「${eduName}を受講する」ボタン

## ${eduName}の法的根拠
### 根拠法令
${lawRef}

### 条文の要点
- 事業者の義務として○○が定められている
- 違反した場合：${penalty}

【参照リンク】
→ e-Gov法令検索：${lawUrl}

## ${eduName}と似た教育との違い
### ${eduName} vs ○○教育
| 項目 | ${eduName} | ○○教育 |
|------|------------|---------|
| 対象者 | ${targetPerson} | △△ |
| 時間 | ${totalHours}時間 | □□時間 |
| 根拠法令 | ${lawRef} | △△法 |

### よくある混同
- 「特別教育」と「技能講習」の違い
- 「安全衛生教育」と「特別教育」の違い

【内部リンク】
→「特別教育と技能講習の違いを詳しく解説」

## ${eduName}の受講対象者
### 受講が義務の人
${targetPerson}

### 具体的には
- ○○の作業に従事する人
- △△を行う現場の作業員
- □□を操作する人

### 受講しなくてもよい人
- ○○の資格をすでに持っている人
- △△の経験が○年以上ある人（一部免除）

## ${eduName}の受講方法と費用
### 受講形式
${onlineAvailable ? `- オンライン講座：${priceOnlineMin}円〜${priceOnlineMax}円
- 対面講座：${priceOfflineMin}円〜${priceOfflineMax}円` : `- 対面講座のみ：${priceOfflineMin}円〜${priceOfflineMax}円`}

### 講習時間
合計${totalHours}時間

【CTA挿入ポイント②】
「${eduName}を申し込む」ボタン
${layerSection}

## まとめ：${eduName}の基本ポイント
- **定義**：${lawRef}に基づく法定教育
- **対象者**：${targetPerson}
- **時間**：${totalHours}時間
- **費用**：${onlineAvailable ? priceOnlineMin + '円〜' : priceOfflineMin + '円〜'}

【関連記事】
→ ${eduName}の完全ガイド（ピラー記事へ）
→ ${eduName}のよくある質問（FAQ記事へ）`;

        titles = [
            `${eduName}とは？初心者向けに分かりやすく解説【${year}年】`,
            `【基礎知識】${eduName}とは｜法的義務・対象者・費用を解説`,
            `${eduName}の意味と目的｜${lawRef}の基本を分かりやすく`
        ];
        metaDesc = `${eduName}とは、${lawRef}に基づく法定教育です。対象者は${targetPerson}。講習時間${totalHours}時間、費用${onlineAvailable ? priceOnlineMin + '円〜' : priceOfflineMin + '円〜'}。基本から分かりやすく解説。`;

        eeaTips = `【E-E-A-T強化チェックリスト】
□ 法令の正確な条文番号・条項を記載
□ 厚生労働省・e-Govへのリンクを設置
□ 最終更新日を明記
□ 監修者情報（資格・経験）を記載`;

        ctaGuide = `【CTA設計ガイド】
1. 定義セクション後
   → 「${eduName}を受講する」ボタン
   → リンク先：${courseUrl}

2. まとめセクション
   → 「今すぐ申し込む」ボタン
   → リンク先：${kciSiteInfo.pages.application}`;

        internalLinks = `【内部リンク設計】
- 「詳しい受講方法」→ ハウツー記事
- 「費用の相場」→ 選び方ガイド記事
- 「よくある質問」→ FAQ記事
- 「受講体験談」→ 事例記事`;

        aiDiffTips = `【AI記事との差別化ポイント】
□ 法令の最新改正情報を反映
□ 現場経験者の補足説明を追加
□ 実際の修了証・講習風景の写真
□ よくある誤解・間違いを訂正`;

    } else if (type === 'checklist') {
        // =============================================
        // チェックリスト記事：実用的なリスト形式
        // =============================================
        outline = `# ${eduName}受講前の準備チェックリスト｜持ち物・確認事項まとめ【${year}年】

【この記事の使い方】
印刷またはブックマークして、受講前にチェックしてください。

## 受講申込前のチェックリスト
### 受講資格の確認
- [ ] 自分が受講対象者か確認した
- [ ] 上司・会社に受講許可を得た
- [ ] 受講日程を確保した（${totalHours}時間）

### 受講形式の選択
- [ ] オンラインか対面か決めた
${practicalRequired ? '- [ ] 実技講習の日程も確認した' : ''}
- [ ] 費用を確認した（${onlineAvailable ? priceOnlineMin + '円〜' : priceOfflineMin + '円〜'}）

### 助成金の確認
- [ ] 人材開発支援助成金の対象か確認した
- [ ] 会社の経理担当に相談した

【CTA挿入ポイント①】
「${eduName}を申し込む」ボタン

## 申込時のチェックリスト
### 必要な情報
- [ ] 氏名（本人確認書類と同じ表記）
- [ ] 生年月日
- [ ] 住所
- [ ] 連絡先（電話番号・メールアドレス）
- [ ] 勤務先情報
- [ ] 支払い方法

### 確認事項
- [ ] 受講日時を確認した
- [ ] キャンセルポリシーを確認した
- [ ] 修了証の発行方法を確認した

## 受講当日の持ち物リスト
### オンライン受講の場合
- [ ] PC・タブレット（推奨スペック確認済み）
- [ ] 安定したインターネット環境
- [ ] ヘッドホン・イヤホン
- [ ] 本人確認書類（顔認証用）
- [ ] 筆記用具（メモ用）
- [ ] 受講に集中できる環境

### 対面講座の場合
- [ ] 本人確認書類（運転免許証など）
- [ ] 受講票・申込確認メール
- [ ] 筆記用具
- [ ] 昼食・飲み物（長時間の場合）
${practicalRequired ? '- [ ] 作業着・安全靴（実技用）\n- [ ] ヘルメット（貸出の場合もあり）' : ''}

## 受講中のチェックリスト
### オンライン受講の注意点
- [ ] 顔認証が正常に動作している
- [ ] カメラから離席していない
- [ ] 集中して受講している
- [ ] 分からない点はメモしている

### 修了試験対策
- [ ] 講習内容を復習した
- [ ] 重要ポイントをメモした

【内部リンク】
→「修了試験の出題傾向と対策」

## 受講後のチェックリスト
### 修了証の確認
- [ ] 修了証を受け取った
- [ ] 記載内容（氏名・生年月日など）に誤りがない
- [ ] 修了証のコピーを保管した
- [ ] 会社に修了報告をした

### 助成金申請（該当者のみ）
- [ ] 申請期限を確認した
- [ ] 必要書類を準備した
- [ ] 申請手続きを完了した

## 修了証の保管について
### 保管のポイント
- 原本は大切に保管
- コピーを複数取っておく
- データ化してクラウド保存も推奨

### 紛失した場合
- 受講機関に再発行を依頼（手数料：1,000〜3,000円程度）
${layerSection}

【CTA挿入ポイント②】
「${eduName}を受講する」ボタン`;

        titles = [
            `【保存版】${eduName}受講前チェックリスト｜持ち物・準備・当日の流れ`,
            `${eduName}の準備完全ガイド｜申込から修了証取得までのチェックリスト`,
            `${eduName}受講に必要なもの一覧｜忘れ物ゼロで当日を迎える方法`
        ];
        metaDesc = `${eduName}受講前の準備チェックリスト。申込前・当日の持ち物・受講後の確認事項を網羅。印刷して使える実用的なリスト形式。`;

        eeaTips = `【E-E-A-T強化チェックリスト】
□ 実際の受講経験に基づくリスト
□ 見落としがちなポイントを強調
□ 印刷用PDFを提供
□ 定期的に最新情報に更新`;

        ctaGuide = `【CTA設計ガイド】
1. 申込前チェックリスト後
   → 「KCI教育センターで申し込む」ボタン
   → リンク先：${kciSiteInfo.pages.application}

2. ページ下部
   → 「今すぐ受講申込」ボタン
   → リンク先：${courseUrl}`;

        internalLinks = `【内部リンク設計】
- 「${eduName}とは」→ 用語解説記事
- 「オンライン受講の詳細」→ ハウツー記事
- 「助成金の申請方法」→ 別記事
- 「受講体験談」→ 事例記事`;

        aiDiffTips = `【AI記事との差別化ポイント】
□ 実際の受講者が「持っていけばよかった」と思ったもの
□ よくある忘れ物・トラブル事例
□ 印刷用レイアウトの提供
□ 受講機関別の注意点`;

    } else if (type === 'news') {
        // =============================================
        // 法改正・ニュース記事：最新情報
        // =============================================
        outline = `# ${eduName}の最新情報｜${year}年の法改正・制度変更まとめ

【この記事について】
${eduName}に関する最新の法改正・制度変更情報をまとめています。
最終更新日：${year}年○月○日

## ${year}年の主な変更点
### 変更点①：○○の改正
- **施行日**：${year}年○月○日
- **変更内容**：○○が△△に変更
- **影響**：受講者は□□に注意が必要

### 変更点②：△△の追加
- **施行日**：${year}年○月○日
- **変更内容**：新たに○○が義務化
- **影響**：対象者が拡大

【参照】厚生労働省発表資料へのリンク

【CTA挿入ポイント①】
「最新カリキュラムで受講する」ボタン

## 法改正の背景
### なぜ改正されたのか
- 労働災害の発生状況
- 現場からの要望
- 国際基準への対応

### 今後の見通し
- ○○年にさらなる改正が予定
- △△の義務化が検討中

## 受講者への影響
### 新規受講者
- ${year}年○月以降の受講者は新カリキュラム適用
- 講習時間：${totalHours}時間（変更なし/○時間増）

### 既受講者
- 再教育の要否：○○
- 修了証の有効性：○○

【内部リンク】
→「${eduName}の再教育について」

## よくある質問
### Q. 改正前に取得した修了証は有効？
A. 有効です。ただし、○○の場合は再教育が推奨されます。

### Q. いつから新カリキュラムが適用？
A. ${year}年○月○日施行の講習から適用です。

### Q. 費用は変わる？
A. ○○（据え置き/○円程度の変更）

【CTA挿入ポイント②】
「最新の${eduName}を受講する」ボタン

## 関連する法令・通達
- ${lawRef}（改正後）
- 厚生労働省通達○○号
- ○○ガイドライン（${year}年版）

【参照リンク】
- e-Gov法令検索：${lawUrl}
- 厚生労働省HP
${layerSection}

## まとめ
${year}年の${eduName}に関する主な変更点をまとめました。
- 変更点①：○○
- 変更点②：△△
- 施行日：${year}年○月○日

最新情報は本記事で随時更新していきます。`;

        titles = [
            `【${year}年】${eduName}の法改正情報｜変更点と受講者への影響`,
            `${eduName}最新ニュース｜${year}年の制度変更・カリキュラム改定まとめ`,
            `【速報】${eduName}が変わる！${year}年の改正ポイントを解説`
        ];
        metaDesc = `${year}年の${eduName}に関する法改正・制度変更情報。変更点、施行日、受講者への影響を分かりやすく解説。最新情報を随時更新。`;

        eeaTips = `【E-E-A-T強化チェックリスト】
□ 厚生労働省・官報の一次情報を参照
□ 施行日・条文番号を正確に記載
□ 最終更新日を明記
□ 変更があれば即座に更新`;

        ctaGuide = `【CTA設計ガイド】
1. 変更点セクション後
   → 「最新カリキュラムで受講する」ボタン
   → リンク先：${courseUrl}

2. まとめセクション
   → 「${eduName}を申し込む」ボタン
   → リンク先：${kciSiteInfo.pages.application}`;

        internalLinks = `【内部リンク設計】
- 「${eduName}の基本」→ 用語解説記事
- 「受講方法」→ ハウツー記事
- 「過去の法改正履歴」→ 別記事
- 「関連する他の教育の改正情報」→ 関連ニュース記事`;

        aiDiffTips = `【AI記事との差別化ポイント】
□ 官報・厚労省発表の一次情報に基づく
□ 法改正の施行日を正確に記載
□ 現場への実際の影響を専門家が解説
□ 随時更新で常に最新情報を提供`;

    } else {
        // デフォルト（その他）
        outline = `# ${mainKw}について【${year}年】

## 概要
${mainKw}に関する記事です。

## 詳細
※記事タイプを選択して再生成してください`;

        titles = [`${mainKw}について【${year}年】`];
        metaDesc = `${mainKw}に関する情報をまとめました。`;
        eeaTips = '記事タイプを選択してください';
        ctaGuide = '記事タイプを選択してください';
        internalLinks = '記事タイプを選択してください';
        aiDiffTips = '記事タイプを選択してください';
    }

    // 競合対策ガイドを追加（SAT対策）
    let competitorStrategyGuide = '';
    if (mainKwStrategy.contentType) {
        competitorStrategyGuide = `

【競合対策ガイド（SAT対策）】
━━━━━━━━━━━━━━━━━━━━━━━
■ このクラスターの分析結果
  - 主要層：${dominantLayer === 'A' ? 'A層（制度解説系）' : dominantLayer === 'B' ? 'B層（業種特化系）' : 'C層（体験・事例系）'}
  - S優先キーワード：${clusterStrategyStats.priorities.S}件 ${hasSPriority ? '← ブルーオーシャン！' : ''}
  - A優先キーワード：${clusterStrategyStats.priorities.A}件

■ コンテンツ差別化戦略
${dominantLayer === 'A' ? `  【A層対策】競合と同等の基礎情報だが、以下で差別化：
  □ 具体的な数字・料金を明記
  □ 法令の条文番号を正確に引用
  □ 「現場では〜」「実務上は〜」の表現を追加
  □ よくある失敗例・注意点を含める` : ''}
${dominantLayer === 'B' ? `  【B層対策】SATにない業種特化の切り口で差別化：
  □ 業種特有の用語・状況を積極的に使用
  □ 「建設業では〜」「製造現場では〜」など具体化
  □ 業種別の事例・ケーススタディを追加
  □ 業界団体・専門機関へのリンクを含める` : ''}
${dominantLayer === 'C' ? `  【C層対策】一次情報で最大の差別化を実現：
  □ 実際の受講体験談を詳細に記述
  □ 「私が受講したときは〜」など一人称を使用
  □ 受講者インタビュー・生の声を掲載
  □ 講習の写真・修了証の画像を追加` : ''}

■ KCIの強み訴求ポイント
  □ オンライン対応（eラーニング・ZOOM）
  □ 最短1日で修了証発行
  □ 顔認証システムでコンプライアンス対応
  □ 土日開催・全国対応`;
    }

    // aiDiffTipsに競合対策ガイドを追加
    aiDiffTips = aiDiffTips + competitorStrategyGuide;

    // 競合データがあれば、不足トピックを追加
    const competitorHeadings = getCompetitorHeadingsForOutline();
    if (competitorHeadings.length > 0) {
        outline = appendCompetitorTopics(outline, competitorHeadings, eduName);
    }

    // SEO統合版の記事構成を生成
    const integratedOutline = generateIntegratedOutline(outline, {
        courseUrl,
        eduName,
        eeaTips,
        ctaGuide,
        internalLinks,
        schemaMarkup,
        aiDiffTips,
        kciSiteInfo
    });

    // 結果をDOMに反映（基本版）
    document.getElementById('article-outline').textContent = outline;

    // SEO統合版を反映
    const integratedEl = document.getElementById('article-outline-integrated');
    if (integratedEl) {
        integratedEl.innerHTML = integratedOutline;
    }

    // タイトル案
    document.getElementById('title-suggestions').innerHTML = titles.map((t, i) => `
        <div class="bg-gray-50 rounded-lg p-3 text-sm">
            <span class="text-xs text-gray-400">案${i + 1}</span>
            <div class="font-medium">${t}</div>
        </div>
    `).join('');

    // メタディスクリプション
    document.getElementById('meta-description').innerHTML = `${metaDesc}<p class="text-xs text-gray-400 mt-2">※${metaDesc.length}文字（120〜160文字推奨）</p>`;

    // 一次情報
    const sources = getPrimarySources(mainKw);
    document.getElementById('primary-sources').innerHTML = sources.map(s => `
        <a href="${s.url}" target="_blank" class="block bg-indigo-50 rounded-lg p-3 text-sm text-indigo-700 hover:bg-indigo-100">
            ${s.title} <span class="text-xs">↗</span>
        </a>
    `).join('');

    // プロ向け追加情報を表示
    document.getElementById('pro-tips-eeat').textContent = eeaTips;
    document.getElementById('pro-tips-cta').textContent = ctaGuide;
    document.getElementById('pro-tips-links').textContent = internalLinks;
    document.getElementById('pro-tips-schema').textContent = schemaMarkup;
    document.getElementById('pro-tips-diff').textContent = aiDiffTips;

    document.getElementById('article-design-result').classList.remove('hidden');

    // SEO採点を自動実行
    setTimeout(() => {
        if (typeof runSEOScoring === 'function') {
            runSEOScoring();
        }
    }, 100);
}

// SEO統合版の記事構成を生成する関数
function generateIntegratedOutline(outline, data) {
    let result = outline;

    // CTA挿入ポイントを実際のCTA HTMLに置換
    result = result.replace(/【CTA挿入ポイント①】[\s\S]*?(?=\n\n|$)/g, `
<div class="cta-box" style="background: linear-gradient(135deg, #eef2ff, #e0e7ff); border: 2px solid #6366f1; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
  <p style="font-weight: bold; color: #4338ca; margin-bottom: 12px;">今すぐ${data.eduName}を受講する</p>
  <a href="${data.courseUrl}" style="display: inline-block; background: #4f46e5; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">KCI教育センターで申し込む →</a>
  <p style="font-size: 12px; color: #64748b; margin-top: 8px;">オンライン・対面どちらも対応</p>
</div>`);

    result = result.replace(/【CTA挿入ポイント②】[\s\S]*?(?=\n\n|$)/g, `
<div class="cta-box-inline" style="display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap;">
  <a href="${data.kciSiteInfo.pages.elearning}" style="flex: 1; min-width: 200px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; text-decoration: none; text-align: center;">
    <span style="font-weight: bold; color: #334155;">eラーニング講座</span><br>
    <span style="font-size: 12px; color: #64748b;">自分のペースで学習</span>
  </a>
  <a href="${data.kciSiteInfo.pages.online}" style="flex: 1; min-width: 200px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; text-decoration: none; text-align: center;">
    <span style="font-weight: bold; color: #334155;">ZOOM講座</span><br>
    <span style="font-size: 12px; color: #64748b;">リアルタイムで質問可能</span>
  </a>
</div>`);

    result = result.replace(/【CTA挿入ポイント③】[\s\S]*?(?=\n\n|$)/g, `
<div class="cta-box-final" style="background: linear-gradient(135deg, #4f46e5, #4338ca); border-radius: 16px; padding: 32px; margin: 24px 0; text-align: center; color: white;">
  <p style="font-size: 20px; font-weight: bold; margin-bottom: 8px;">${data.eduName}を受講するなら</p>
  <p style="margin-bottom: 16px; opacity: 0.9;">KCI教育センターは全国対応・即日修了証発行</p>
  <a href="${data.kciSiteInfo.pages.application}" style="display: inline-block; background: white; color: #4f46e5; padding: 16px 48px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">今すぐ申し込む →</a>
  <div style="margin-top: 16px; display: flex; justify-content: center; gap: 24px; font-size: 14px; opacity: 0.9;">
    <span>✓ オンライン対応</span>
    <span>✓ 助成金対象</span>
    <span>✓ 法人一括対応</span>
  </div>
</div>`);

    // 内部リンクを実際のリンクに置換
    result = result.replace(/【内部リンク①】[\s\S]*?(?=\n\n|$)/g, `
<div class="internal-link" style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 12px 16px; margin: 16px 0;">
  <span style="font-size: 12px; color: #64748b;">関連記事</span><br>
  <a href="#" style="color: #4f46e5; text-decoration: none; font-weight: 500;">→ ${data.eduName}と他の資格の違いを詳しく解説</a>
</div>`);

    result = result.replace(/【内部リンク②】[\s\S]*?(?=\n\n|$)/g, `
<div class="internal-link" style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 12px 16px; margin: 16px 0;">
  <span style="font-size: 12px; color: #64748b;">関連記事</span><br>
  <a href="#" style="color: #4f46e5; text-decoration: none; font-weight: 500;">→ 人材開発支援助成金の申請方法を詳しく解説</a>
</div>`);

    // E-E-A-T要素を具体的な内容に置換
    result = result.replace(/【この記事の信頼性】[\s\S]*?(?=\n\n)/g, `
<div class="eeat-box" style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 16px; margin: 16px 0;">
  <p style="font-weight: bold; color: #854d0e; margin-bottom: 8px;"><span class="material-symbols-outlined" style="vertical-align: middle;">verified</span> この記事の信頼性</p>
  <ul style="margin: 0; padding-left: 20px; color: #713f12; font-size: 14px;">
    <li>執筆：安全衛生教育の専門スタッフ（実務経験10年以上）</li>
    <li>監修：KCI教育センター講師陣</li>
    <li>参照：厚生労働省・労働安全衛生法の公式資料</li>
    <li>最終更新：${new Date().toLocaleDateString('ja-JP')}</li>
  </ul>
</div>`);

    result = result.replace(/【執筆者情報】[\s\S]*?(?=\n\n)/g, `
<div class="author-box" style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0; display: flex; gap: 16px; align-items: center;">
  <div style="width: 64px; height: 64px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
    <span class="material-symbols-outlined" style="font-size: 32px; color: #16a34a;">person</span>
  </div>
  <div>
    <p style="font-weight: bold; color: #166534; margin-bottom: 4px;">この記事を書いた人</p>
    <p style="font-size: 14px; color: #15803d; margin: 0;">KCI教育センター 安全教育チーム<br>
    <span style="font-size: 12px; color: #22c55e;">労働安全衛生の専門家が実体験に基づいて解説</span></p>
  </div>
</div>`);

    // 差別化ポイントを具体的なアドバイスに置換
    result = result.replace(/【差別化ポイント】[\s\S]*?(?=\n\n|$)/g, `
<div class="diff-tip" style="background: #fdf4ff; border: 1px dashed #e879f9; border-radius: 8px; padding: 12px 16px; margin: 16px 0;">
  <p style="font-weight: bold; color: #a21caf; margin-bottom: 8px;"><span class="material-symbols-outlined" style="vertical-align: middle;">tips_and_updates</span> ここで差別化</p>
  <p style="font-size: 14px; color: #86198f; margin: 0;">現場経験に基づく具体例やよくある失敗談を追加すると、AI生成記事との差別化になります。</p>
</div>`);

    result = result.replace(/【差別化】[\s\S]*?(?=\n\n|$)/g, `
<div class="diff-tip-inline" style="background: #fdf4ff; padding: 8px 12px; border-radius: 6px; margin: 8px 0; font-size: 13px; color: #a21caf;">
  <span class="material-symbols-outlined" style="vertical-align: middle; font-size: 16px;">tips_and_updates</span> 実体験に基づく失敗談・成功事例を追加
</div>`);

    // プレーンテキストをHTMLとして整形
    result = result
        .replace(/^# (.+)$/gm, '<h1 style="font-size: 24px; font-weight: bold; color: #1e293b; border-bottom: 3px solid #6366f1; padding-bottom: 8px; margin: 24px 0 16px;">$1</h1>')
        .replace(/^## (.+)$/gm, '<h2 style="font-size: 20px; font-weight: bold; color: #334155; border-left: 4px solid #6366f1; padding-left: 12px; margin: 20px 0 12px;">$1</h2>')
        .replace(/^### (.+)$/gm, '<h3 style="font-size: 16px; font-weight: bold; color: #475569; margin: 16px 0 8px;">$1</h3>')
        .replace(/^#### (.+)$/gm, '<h4 style="font-size: 14px; font-weight: bold; color: #64748b; margin: 12px 0 6px;">$1</h4>')
        .replace(/^- (.+)$/gm, '<li style="margin: 4px 0; padding-left: 8px;">$1</li>')
        .replace(/\n\n/g, '</p><p style="margin: 12px 0;">')
        .replace(/\|(.+)\|/g, '<code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">$1</code>');

    return `<div class="integrated-outline" style="font-family: sans-serif; line-height: 1.8; color: #334155;">${result}</div>`;
}

// ========== AI設定 ==========
const AI_CONFIG = {
    claude: {
        name: 'Claude',
        url: 'https://claude.ai/',
        color: 'purple',
        icon: '🟣'
    },
    chatgpt: {
        name: 'ChatGPT',
        url: 'https://chat.openai.com/',
        color: 'green',
        icon: '🟢'
    },
    gemini: {
        name: 'Gemini',
        url: 'https://gemini.google.com/',
        color: 'blue',
        icon: '🔵'
    }
};

// 選択されているAIを取得
function getSelectedAI() {
    const selected = document.querySelector('input[name="ai-select"]:checked');
    return selected ? selected.value : 'claude';
}

// ========== AIプロンプト生成（マルチAI対応） ==========
function copyForAI() {
    const outline = document.getElementById('article-outline').textContent;
    const cluster = clusters[selectedClusterIndex];
    const mainKw = cluster.keywords[0]?.keyword || cluster.name;
    const sources = getPrimarySources(mainKw);
    const articleType = document.querySelector('input[name="article-type"]:checked').value;
    const selectedAI = getSelectedAI();
    const aiConfig = AI_CONFIG[selectedAI];

    // 教育種別を判定
    let eduKey = null;
    let eduData = null;
    const eduKeyMapping = [
        { patterns: ['職長'], key: '職長' },
        { patterns: ['フルハーネス'], key: 'フルハーネス' },
        { patterns: ['足場'], key: '足場' },
        { patterns: ['酸欠', '酸素欠乏'], key: '酸欠' },
        { patterns: ['粉じん', '粉塵'], key: '粉じん' },
        { patterns: ['低圧電気', '低圧'], key: '低圧電気' },
        { patterns: ['玉掛け', '玉掛'], key: '玉掛け' },
        { patterns: ['フォークリフト'], key: 'フォークリフト' }
    ];
    for (const mapping of eduKeyMapping) {
        if (mapping.patterns.some(p => mainKw.includes(p))) {
            eduKey = mapping.key;
            eduData = educationMasterData[eduKey];
            break;
        }
    }

    // 競合対策分析（クラスターの主要キーワードから）
    const clusterStrategyStats = { layers: { A: 0, B: 0, C: 0 }, priorities: { S: 0, A: 0, B: 0, C: 0 } };
    cluster.keywords.forEach(kw => {
        if (kw.contentType) clusterStrategyStats.layers[kw.contentType]++;
        if (kw.strategyPriority) clusterStrategyStats.priorities[kw.strategyPriority]++;
    });
    const dominantLayer = Object.entries(clusterStrategyStats.layers).sort((a, b) => b[1] - a[1])[0]?.[0] || 'A';
    const mainKwStrategy = cluster.keywords[0] || {};

    // A/B/C層に応じた差別化指示
    let layerInstruction = '';
    if (dominantLayer === 'A') {
        layerInstruction = `【コンテンツ層：A層（制度解説系）】
このキーワードは競合（SAT等）も多くカバーしている基礎情報領域です。
差別化のために以下を必ず含めてください：
- 法令の条文番号を正確に引用（例：労働安全衛生法第○条）
- 「現場では〜」「実務上は〜」という現場経験に基づく補足
- よくある失敗例や注意点
- 具体的な数字（料金、時間など）`;
    } else if (dominantLayer === 'B') {
        layerInstruction = `【コンテンツ層：B層（業種特化系）】
このキーワードは業種特化の切り口です。競合（SAT等）にない差別化ポイントになります。
以下を必ず含めてください：
- 業種特有の用語・状況を積極的に使用
- 「建設業では〜」「製造現場では〜」など具体的なシーン
- その業種ならではの事例やケーススタディ
- 業界団体や専門機関への参照`;
    } else if (dominantLayer === 'C') {
        layerInstruction = `【コンテンツ層：C層（体験・事例系）】
このキーワードは一次情報で最大の差別化が可能な領域です。AIでは書けない価値を出してください。
以下を必ず含めてください：
- 「私が受講したときは〜」など一人称の体験談
- 受講者の生の声・インタビュー形式のコンテンツ
- 「実際に○○してみて分かったこと」
- 講習の具体的な様子（雰囲気、他の受講者の反応など）
- [画像：○○の写真] の指示を多めに入れる`;
    }

    // 記事タイプ別の指示
    let typeInstruction = '';
    if (articleType === 'pillar') {
        typeInstruction = 'この記事は「ピラー記事」です。網羅的な総合ガイドとして、初心者から経験者まで参考になる内容にしてください。';
    } else if (articleType === 'howto') {
        typeInstruction = 'この記事は「ハウツー記事」です。手順を明確にし、読者が実際に行動できるよう具体的に書いてください。';
    } else if (articleType === 'comparison') {
        typeInstruction = 'この記事は「選び方ガイド」です。講座選びのポイントを解説し、KCI教育センターの講座を自然に紹介してください。他社との比較・ランキングは不要です。';
    } else {
        typeInstruction = 'この記事は「FAQ記事」です。質問と回答を明確に分け、簡潔かつ正確に回答してください。';
    }

    // 実データがある場合は追加情報を含める
    let dataInfo = '';
    if (eduData) {
        dataInfo = `
【この教育の正確なデータ】
- 正式名称：${eduData.name}
- 根拠法令：${eduData.law}
- 講習時間：${eduData.totalHours}時間
- 対象者：${eduData.targetPerson}
- 対象業種：${eduData.industries}
- 罰則：${eduData.penalty}
- オンライン受講：${eduData.onlineAvailable ? '可能' : '不可'}
${eduData.practicalRequired ? `- 実技講習：${eduData.practicalNote}` : ''}
- 有効期限：${eduData.validityPeriod}
- 再教育：${eduData.recommendedRefresh}
- 料金相場：
  ${eduData.priceRange.online ? `オンライン ${eduData.priceRange.online.min.toLocaleString()}円〜${eduData.priceRange.online.max.toLocaleString()}円` : ''}
  対面 ${eduData.priceRange.offline.min.toLocaleString()}円〜${eduData.priceRange.offline.max.toLocaleString()}円
`;
    }

    const prompt = `あなたは建設業の安全教育に詳しいSEOライターです。以下の情報に基づいて、プロ品質のSEO記事を作成してください。

【ターゲットキーワード】
${mainKw}

${layerInstruction}

【記事タイプ】
${typeInstruction}

【記事構成】
${outline}

【参照すべき一次情報（必ずリンクを記事内に含める）】
${sources.map(s => `- ${s.title}: ${s.url}`).join('\n')}
${dataInfo}

【執筆ルール - 必ず守ること】
1. ターゲット読者：建設業の現場で働く人（職長、作業員、安全管理者など）
2. 文体：「です・ます」調、専門用語は初出時に説明を添える
3. E-E-A-T強化：
   - 法令の条文番号を明記（例：労働安全衛生法第60条）
   - 具体的な数字を使う（○○円ではなく実際の金額を）
   - 「現場では〜」「実務上は〜」など経験に基づく表現を適宜追加
4. 構成案の【】で囲まれた指示（CTA挿入ポイント、内部リンク、差別化ポイントなど）は、記事には含めず、指示に従って該当箇所の内容を工夫してください
5. 文字数：3000〜5000文字程度
6. AI記事との差別化：
   - 「よくある失敗」「注意点」など実体験ベースの情報を含める
   - 「〜の場合はどうする？」というニッチな疑問にも回答
   - 画像を入れる場所の指示（[画像：○○の写真]など）を適宜挿入

【出力形式】
- Markdown形式で出力
- 見出しはH2（##）、H3（###）を使用
- 重要な数字やポイントは太字（**）で強調
- 表は適宜使用

よろしくお願いします。`;

    // モーダルを更新
    document.getElementById('ai-modal-title').textContent = `${aiConfig.icon} ${aiConfig.name}に送るプロンプト`;
    document.getElementById('ai-modal-description').textContent = `以下のプロンプトをコピーして${aiConfig.name}に貼り付けてください`;
    document.getElementById('ai-prompt').value = prompt;
    document.getElementById('ai-link').href = aiConfig.url;
    document.getElementById('ai-link').textContent = `${aiConfig.name}を開く`;
    document.getElementById('ai-modal').classList.remove('hidden');
}

function closeAIModal() {
    document.getElementById('ai-modal').classList.add('hidden');
}

function copyAIPrompt() {
    const textarea = document.getElementById('ai-prompt');
    copyToClipboard(textarea.value, 'プロンプトをコピーしました');
}

// 後方互換性のため古い関数名も維持
function copyForClaude() { copyForAI(); }
function closeClaudeModal() { closeAIModal(); }
function copyClaudePrompt() { copyAIPrompt(); }

// ========== 構成案コピー ==========
function copyOutline() {
    const outline = document.getElementById('article-outline').textContent;
    const titles = Array.from(document.getElementById('title-suggestions').querySelectorAll('.font-medium')).map(el => el.textContent).join('\n');
    const sources = Array.from(document.getElementById('primary-sources').querySelectorAll('a')).map(el => el.textContent.trim() + ': ' + el.href).join('\n');

    const text = `【記事構成案】\n${outline}\n\n【タイトル案】\n${titles}\n\n【参照すべき一次情報】\n${sources}`;
    copyToClipboard(text, '構成案をコピーしました');
}

// ========== 汎用コピー関数 ==========
function copyToClipboard(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => alert(message)).catch(() => fallbackCopy(text, message));
    } else {
        fallbackCopy(text, message);
    }
}

function fallbackCopy(text, message) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        alert(message);
    } catch (e) {
        alert('コピーに失敗しました');
    }
    document.body.removeChild(textarea);
}

// ========== CSV出力 ==========
function exportCSV() {
    if (keywords.length === 0) { alert('データがありません'); return; }
    const data = keywords.map(kw => {
        const sources = getPrimarySources(kw.keyword);
        return {
            キーワード: kw.keyword,
            グループ: kw.cluster,
            推定ボリューム: kw.volume,
            検索意図: kw.intent,
            CV期待度: kw.cvExpect,
            層: kw.contentType ? kw.contentType + '層' : '',
            対策優先度: kw.strategyPriority || '',
            差別化余地: kw.diffPotential === 'high' ? '高' : kw.diffPotential === 'mid' ? '中' : '低',
            業種特化: kw.targetIndustry || '',
            一次情報URL: sources[0]?.url || ''
        };
    });
    const csv = Papa.unparse(data);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'keyword-analysis.csv';
    a.click();
}

// ========== データ保存 ==========
function saveData() {
    try {
        const data = { keywords, clusters, savedAt: new Date().toISOString() };
        localStorage.setItem('seo-keyword-tool-v4', JSON.stringify(data));
        alert('データを保存しました');
    } catch (e) {
        alert('保存に失敗しました');
    }
}

// ========== プロ向けタブ切り替え ==========
function showProTab(tabName) {
    // 全タブを非表示
    document.querySelectorAll('.pro-tab-content').forEach(el => el.classList.add('hidden'));
    // 全ボタンをリセット
    document.querySelectorAll('.pro-tab-btn').forEach(btn => {
        btn.classList.remove('bg-purple-100', 'text-purple-700', 'bg-green-100', 'text-green-700', 'bg-blue-100', 'text-blue-700', 'bg-amber-100', 'text-amber-700', 'bg-red-100', 'text-red-700');
        btn.classList.add('bg-gray-100', 'text-gray-600');
    });

    // 選択したタブを表示
    document.getElementById(`pro-tab-${tabName}`).classList.remove('hidden');

    // ボタンのスタイルを変更
    const btn = document.querySelector(`.pro-tab-btn[data-tab="${tabName}"]`);
    btn.classList.remove('bg-gray-100', 'text-gray-600');

    const colorMap = {
        'eeat': ['bg-purple-100', 'text-purple-700'],
        'cta': ['bg-green-100', 'text-green-700'],
        'links': ['bg-blue-100', 'text-blue-700'],
        'schema': ['bg-amber-100', 'text-amber-700'],
        'diff': ['bg-red-100', 'text-red-700']
    };
    btn.classList.add(...colorMap[tabName]);
}

// ========== 記事構成タブ切り替え ==========
function showOutlineTab(tabName) {
    // 全タブコンテンツを非表示
    document.querySelectorAll('.outline-tab-content').forEach(el => el.classList.add('hidden'));

    // 全ボタンをリセット
    document.querySelectorAll('.outline-tab-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-100', 'text-indigo-700');
        btn.classList.add('bg-gray-100', 'text-gray-600');
    });

    // 選択したタブを表示
    if (tabName === 'basic') {
        document.getElementById('article-outline-basic').classList.remove('hidden');
    } else if (tabName === 'integrated') {
        document.getElementById('article-outline-integrated-container').classList.remove('hidden');
    }

    // ボタンのスタイルを変更
    const btn = document.querySelector(`.outline-tab-btn[data-tab="${tabName}"]`);
    btn.classList.remove('bg-gray-100', 'text-gray-600');
    btn.classList.add('bg-indigo-100', 'text-indigo-700');
}

// ========== 競合分析機能 ==========
let currentCompetitorKeyword = '';
let competitorData = [];

// 競合分析タブへ遷移
function goToCompetitorAnalysis(keyword) {
    currentCompetitorKeyword = keyword || '';

    // 入力をクリア
    for (let i = 1; i <= 3; i++) {
        const titleInput = document.getElementById(`comp-${i}-title`);
        const headingsInput = document.getElementById(`comp-${i}-headings`);
        if (titleInput) titleInput.value = '';
        if (headingsInput) headingsInput.value = '';
    }
    document.getElementById('competitor-analysis-result').classList.add('hidden');

    // 競合分析タブに切り替え
    showArticleMainTab('competitor');
}

// 競合分析をスキップ（構成作成タブへ）
function skipCompetitorAnalysis() {
    showArticleMainTab('design');
}

// 競合見出し分析データ
let competitorHeadingsData = {
    sites: [],
    mustHave: [],
    diffHeadings: [],
    recommended: []
};

// 見出し分析実行
function analyzeCompetitorHeadings() {
    const sites = [];

    // 3サイト分の見出しを取得
    for (let i = 1; i <= 3; i++) {
        const title = document.getElementById(`comp-${i}-title`)?.value.trim() || `${i}位サイト`;
        const headingsText = document.getElementById(`comp-${i}-headings`)?.value.trim() || '';

        if (headingsText) {
            const headings = headingsText.split('\n')
                .map(h => h.trim())
                .filter(h => h && !h.startsWith('例：'))
                .map(h => normalizeHeading(h));
            sites.push({ rank: i, title, headings });
        }
    }

    if (sites.length === 0) {
        alert('少なくとも1サイトの見出しを入力してください');
        return;
    }

    competitorHeadingsData.sites = sites;

    // 見出し分析
    analyzeHeadings(sites);

    // 結果表示
    renderHeadingAnalysis();
    document.getElementById('competitor-analysis-result').classList.remove('hidden');
}

// 見出しの正規化（前処理）
function normalizeHeading(heading) {
    return heading
        .replace(/^[#\-•◆■□●○▶︎▷→・\d\.]+\s*/, '') // 記号・番号除去
        .replace(/\s+/g, ' ')
        .trim();
}

// 見出し分析ロジック
function analyzeHeadings(sites) {
    const allHeadings = [];
    const headingCount = {};

    // 全見出しをカウント
    sites.forEach(site => {
        site.headings.forEach(h => {
            const key = getHeadingKey(h);
            if (!headingCount[key]) {
                headingCount[key] = { original: h, count: 0, sites: [] };
            }
            headingCount[key].count++;
            headingCount[key].sites.push(site.rank);
        });
    });

    // 必須見出し（2サイト以上で共通）
    competitorHeadingsData.mustHave = Object.values(headingCount)
        .filter(h => h.count >= 2)
        .sort((a, b) => b.count - a.count)
        .map(h => ({ text: h.original, count: h.count, sites: h.sites }));

    // 差別化見出し（1サイトのみ）
    competitorHeadingsData.diffHeadings = Object.values(headingCount)
        .filter(h => h.count === 1)
        .map(h => ({ text: h.original, site: h.sites[0] }));

    // KCI独自の強み提案
    competitorHeadingsData.kciUnique = generateKCIUniqueHeadings(headingCount);

    // 推奨構成を生成
    competitorHeadingsData.recommended = generateRecommendedStructure();
}

// 見出しのキー生成（類似見出しをグルーピング）
function getHeadingKey(heading) {
    const h = heading.toLowerCase();

    // 類似パターンをグルーピング
    const patterns = [
        { keywords: ['とは', '定義', '概要', '基本'], key: '基本・定義' },
        { keywords: ['対象', '誰', '受講者', '必要な人'], key: '対象者' },
        { keywords: ['内容', 'カリキュラム', '科目', '学ぶ'], key: 'カリキュラム' },
        { keywords: ['時間', '期間', '日数', '何時間'], key: '受講時間' },
        { keywords: ['費用', '料金', '価格', '値段', '金額'], key: '費用' },
        { keywords: ['方法', '受け方', '申込', '申し込み', 'どこで'], key: '受講方法' },
        { keywords: ['オンライン', 'web', 'ウェブ', 'eラーニング'], key: 'オンライン' },
        { keywords: ['有効期限', '更新', '再教育', '何年'], key: '有効期限・更新' },
        { keywords: ['違い', '比較', 'との差'], key: '違い・比較' },
        { keywords: ['メリット', '利点', '良い点'], key: 'メリット' },
        { keywords: ['注意', 'デメリット', '気をつける'], key: '注意点' },
        { keywords: ['よくある質問', 'faq', 'q&a', '質問'], key: 'FAQ' },
        { keywords: ['まとめ', '結論', '最後に'], key: 'まとめ' },
        { keywords: ['法令', '法律', '根拠', '義務'], key: '法的根拠' },
        { keywords: ['罰則', '違反', 'ペナルティ'], key: '罰則' },
        { keywords: ['実務', '現場', '実際', '体験'], key: '実務・現場' }
    ];

    for (const p of patterns) {
        if (p.keywords.some(kw => h.includes(kw))) {
            return p.key;
        }
    }
    return heading; // マッチしなければそのまま
}

// KCI独自の強み提案生成
function generateKCIUniqueHeadings(existingHeadings) {
    const kciStrengths = [
        { text: 'オンライン受講のメリット（場所・時間を選ばない）', category: 'オンライン強み' },
        { text: '最短で修了証を取得する方法', category: 'スピード' },
        { text: '受講者の声・体験談', category: 'E-E-A-T' },
        { text: '他社との料金比較表', category: '差別化' },
        { text: '申込から修了証発行までの流れ（図解）', category: 'わかりやすさ' },
        { text: 'スマホ・タブレットでの受講方法', category: '利便性' },
        { text: '法人・団体向け割引について', category: '法人訴求' },
        { text: '修了証のサンプル・発行日数', category: '信頼性' },
        { text: '24時間いつでも受講可能', category: '利便性' },
        { text: 'よくある失敗例と対策', category: '実用性' }
    ];

    // 既存見出しにないものを抽出
    const existingKeys = new Set(Object.keys(existingHeadings));
    return kciStrengths.filter(s => {
        const key = getHeadingKey(s.text);
        return !existingKeys.has(key);
    });
}

// 推奨見出し構成を生成
function generateRecommendedStructure() {
    const structure = [];

    // 1. 必須見出しを追加（優先順位順）
    const mustHaveOrder = ['基本・定義', '対象者', 'カリキュラム', '受講時間', '費用', '受講方法', '法的根拠'];
    mustHaveOrder.forEach(key => {
        const found = competitorHeadingsData.mustHave.find(h => getHeadingKey(h.text) === key);
        if (found) {
            structure.push({ text: found.text, type: 'must', reason: `${found.count}サイト共通` });
        }
    });

    // 残りの必須見出しも追加
    competitorHeadingsData.mustHave.forEach(h => {
        if (!structure.find(s => getHeadingKey(s.text) === getHeadingKey(h.text))) {
            structure.push({ text: h.text, type: 'must', reason: `${h.count}サイト共通` });
        }
    });

    // 2. KCI独自の強み（差別化ポイント）
    competitorHeadingsData.kciUnique.slice(0, 3).forEach(h => {
        structure.push({ text: h.text, type: 'unique', reason: '競合にない独自コンテンツ' });
    });

    // 3. まとめ・CTA
    structure.push({ text: 'まとめ：今すぐ受講を申し込む', type: 'cta', reason: 'CV獲得' });

    return structure;
}

// 見出し分析結果をレンダリング
function renderHeadingAnalysis() {
    // 必須見出し
    const mustHaveHtml = competitorHeadingsData.mustHave.map(h => `
        <div class="flex items-center gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
            <span class="text-red-600 font-bold">${h.count}/${competitorHeadingsData.sites.length}</span>
            <span class="flex-1 text-gray-800">${h.text}</span>
            <span class="text-xs text-gray-500">${h.sites.map(s => s + '位').join(', ')}</span>
        </div>
    `).join('');
    document.getElementById('must-have-headings').innerHTML = mustHaveHtml || '<p class="text-gray-500 text-sm">共通見出しなし</p>';

    // 差別化見出し
    const diffHtml = competitorHeadingsData.diffHeadings.slice(0, 8).map(h => `
        <div class="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-200">
            <span class="text-green-600 text-sm">${h.site}位のみ</span>
            <span class="flex-1 text-gray-800">${h.text}</span>
        </div>
    `).join('');
    document.getElementById('diff-headings').innerHTML = diffHtml || '<p class="text-gray-500 text-sm">差別化見出しなし</p>';

    // KCI独自
    const kciHtml = competitorHeadingsData.kciUnique.map(h => `
        <div class="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-200">
            <span class="material-symbols-outlined text-indigo-600">star</span>
            <span class="flex-1 text-gray-800">${h.text}</span>
            <span class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">${h.category}</span>
        </div>
    `).join('');
    document.getElementById('kci-unique-headings').innerHTML = kciHtml;

    // 推奨構成
    const recommendedHtml = competitorHeadingsData.recommended.map((h, i) => {
        const typeColors = {
            must: 'border-indigo-400 bg-indigo-50',
            unique: 'border-indigo-300 bg-indigo-50',
            cta: 'border-slate-300 bg-slate-50'
        };
        const typeLabels = {
            must: '<span class="material-symbols-outlined icon-sm">priority_high</span> 必須',
            unique: '<span class="material-symbols-outlined icon-sm">star</span> 差別化',
            cta: '<span class="material-symbols-outlined icon-sm">ads_click</span> CTA'
        };
        return `
            <div class="flex items-center gap-2 p-2 rounded-lg border ${typeColors[h.type]}">
                <span class="text-gray-500 font-mono text-sm w-6">${i + 1}.</span>
                <span class="flex-1 font-medium text-gray-800">${h.text}</span>
                <span class="text-xs text-gray-500">${typeLabels[h.type]}</span>
            </div>
        `;
    }).join('');
    document.getElementById('recommended-structure').innerHTML = recommendedHtml;

    // 比較表
    renderComparisonTable();
}

// 競合比較表をレンダリング（v4: ヒートマップ対応）
function renderComparisonTable() {
    if (competitorHeadingsData.sites.length === 0) return;

    const siteCount = competitorHeadingsData.sites.length;

    // カバレッジサマリーを計算
    const topicCoverage = {};
    competitorHeadingsData.sites.forEach(site => {
        site.headings.forEach(h => {
            const key = getHeadingKey(h);
            if (!topicCoverage[key]) topicCoverage[key] = 0;
            topicCoverage[key]++;
        });
    });

    let tableHtml = `
        <div class="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <h4 class="font-semibold text-gray-700 mb-2">カバレッジヒートマップ</h4>
            <div class="flex gap-4 text-xs">
                <span class="flex items-center gap-1"><span class="w-4 h-4 rounded heatmap-high"></span> 全サイト共通</span>
                <span class="flex items-center gap-1"><span class="w-4 h-4 rounded heatmap-mid"></span> 一部で使用</span>
                <span class="flex items-center gap-1"><span class="w-4 h-4 rounded heatmap-low"></span> 1サイトのみ</span>
                <span class="flex items-center gap-1"><span class="w-4 h-4 rounded heatmap-none"></span> 未使用</span>
            </div>
        </div>
    `;

    tableHtml += '<table class="w-full text-sm border-collapse">';
    tableHtml += '<thead><tr class="bg-gray-100">';
    tableHtml += '<th class="border p-2 text-left">見出しトピック</th>';
    tableHtml += '<th class="border p-2 text-center">カバレッジ</th>';
    competitorHeadingsData.sites.forEach(site => {
        tableHtml += `<th class="border p-2 text-center">${site.rank}位</th>`;
    });
    tableHtml += '<th class="border p-2 text-center bg-blue-100">KCI推奨</th>';
    tableHtml += '</tr></thead><tbody>';

    // 全トピックを収集
    const allTopics = new Set();
    competitorHeadingsData.sites.forEach(site => {
        site.headings.forEach(h => allTopics.add(getHeadingKey(h)));
    });
    competitorHeadingsData.kciUnique.forEach(h => allTopics.add(getHeadingKey(h.text)));

    // カバレッジ順でソート
    const sortedTopics = Array.from(allTopics).sort((a, b) => (topicCoverage[b] || 0) - (topicCoverage[a] || 0));

    sortedTopics.forEach(topic => {
        const coverage = topicCoverage[topic] || 0;
        const coveragePercent = Math.round((coverage / siteCount) * 100);

        // ヒートマップクラス
        let heatClass = 'heatmap-none';
        if (coverage === siteCount) heatClass = 'heatmap-high';
        else if (coverage >= siteCount / 2) heatClass = 'heatmap-mid';
        else if (coverage > 0) heatClass = 'heatmap-low';

        tableHtml += '<tr class="hover:bg-gray-50">';
        tableHtml += `<td class="border p-2 font-medium">${topic}</td>`;
        tableHtml += `<td class="border p-2 text-center heatmap-cell ${heatClass}">${coveragePercent}%</td>`;

        competitorHeadingsData.sites.forEach(site => {
            const has = site.headings.some(h => getHeadingKey(h) === topic);
            tableHtml += `<td class="border p-2 text-center">${has ? '<span class="material-symbols-outlined text-indigo-600 icon-sm">check_circle</span>' : '<span class="text-gray-300">−</span>'}</td>`;
        });

        // KCI推奨
        const kciHas = competitorHeadingsData.recommended.some(h => getHeadingKey(h.text) === topic);
        tableHtml += `<td class="border p-2 text-center bg-indigo-50">${kciHas ? '<span class="material-symbols-outlined text-indigo-600 icon-sm">star</span> 推奨' : '<span class="text-gray-300">−</span>'}</td>`;
        tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';

    // 差別化提案を追加
    const uncoveredByAll = sortedTopics.filter(t => (topicCoverage[t] || 0) < siteCount);
    if (uncoveredByAll.length > 0) {
        tableHtml += `
            <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 class="font-semibold text-green-700 mb-2">差別化チャンス</h4>
                <p class="text-xs text-green-600 mb-2">以下のトピックは競合全員がカバーしていません。追加すれば差別化できます：</p>
                <div class="flex flex-wrap gap-2">
                    ${uncoveredByAll.slice(0, 5).map(t => `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">${t}</span>`).join('')}
                </div>
            </div>
        `;
    }

    document.getElementById('comparison-table').innerHTML = tableHtml;
}

// 推奨構成をコピー
function copyRecommendedStructure() {
    const keyword = currentCompetitorKeyword || '対象キーワード';
    let text = `# ${keyword} 記事構成案\n\n`;
    competitorHeadingsData.recommended.forEach((h, i) => {
        text += `## ${h.text}\n`;
    });
    text += `\n---\n生成日: ${new Date().toLocaleDateString('ja-JP')}\nKCI教育センター SEOツール`;

    navigator.clipboard.writeText(text).then(() => {
        alert('構成をコピーしました！');
    });
}

// 記事設計に反映（旧関数 - 互換性のため残す）
function applyToArticleDesign() {
    applyAndSwitchToDesign();
}

// ========== v4: エクスポート機能 ==========
function openExportModal() {
    if (keywords.length === 0) { alert('データがありません'); return; }
    document.getElementById('export-modal').classList.remove('hidden');
}
function closeExportModal() {
    document.getElementById('export-modal').classList.add('hidden');
}

// Excel出力（SheetJS使用）
function exportExcel() {
    if (keywords.length === 0) { alert('データがありません'); return; }

    // キーワードシート（競合対策データ含む）
    const kwData = keywords.map(kw => ({
        キーワード: kw.keyword,
        グループ: kw.cluster,
        検索ボリューム: kw.volume,
        検索意図: kw.intent,
        CV期待度: kw.cvExpect + '%',
        層: kw.contentType ? kw.contentType + '層' : '',
        対策優先度: kw.strategyPriority || '',
        差別化余地: kw.diffPotential === 'high' ? '高' : kw.diffPotential === 'mid' ? '中' : '低',
        競合カバー: kw.competitorCoverage === 'high' ? '高' : kw.competitorCoverage === 'mid' ? '中' : '低',
        業種特化: kw.targetIndustry || '',
        推奨: kw.recommendation || ''
    }));

    // クラスターシート
    const clData = clusters.map(c => {
        // クラスター内の競合対策統計
        const stats = { S: 0, A: 0, B: 0, C: 0, layers: { A: 0, B: 0, C: 0 } };
        c.keywords.forEach(kw => {
            if (kw.strategyPriority) stats[kw.strategyPriority]++;
            if (kw.contentType) stats.layers[kw.contentType]++;
        });
        const dominantLayer = Object.entries(stats.layers).sort((a, b) => b[1] - a[1])[0]?.[0] || 'A';
        return {
            グループ名: c.name,
            優先度: c.priority,
            キーワード数: c.keywords.length,
            CV期待度: c.cvExpect + '%',
            主要層: dominantLayer + '層',
            S優先数: stats.S,
            A優先数: stats.A,
            主要KW: c.keywords.slice(0, 3).map(k => k.keyword).join(', ')
        };
    });

    // 優先度TOP20シート（競合対策データ含む）
    const top20 = keywords.slice(0, 20).map((kw, i) => ({
        順位: i + 1,
        キーワード: kw.keyword,
        グループ: kw.cluster,
        ボリューム: kw.volume,
        層: kw.contentType ? kw.contentType + '層' : '',
        対策優先度: kw.strategyPriority || '',
        CV期待度: kw.cvExpect + '%'
    }));

    // 競合対策サマリーシート
    const strategyCounts = { S: 0, A: 0, B: 0, C: 0 };
    const layerCounts = { A: 0, B: 0, C: 0 };
    keywords.forEach(kw => {
        if (kw.strategyPriority) strategyCounts[kw.strategyPriority]++;
        if (kw.contentType) layerCounts[kw.contentType]++;
    });
    const strategySummary = [
        { 項目: '総キーワード数', 値: keywords.length },
        { 項目: 'S優先（ブルーオーシャン）', 値: strategyCounts.S },
        { 項目: 'A優先（差別化推奨）', 値: strategyCounts.A },
        { 項目: 'B優先（中優先）', 値: strategyCounts.B },
        { 項目: 'C優先（低優先）', 値: strategyCounts.C },
        { 項目: 'A層（制度解説系）', 値: layerCounts.A },
        { 項目: 'B層（業種特化系）', 値: layerCounts.B },
        { 項目: 'C層（体験・事例系）', 値: layerCounts.C }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(strategySummary), '競合対策サマリー');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kwData), 'キーワード一覧');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(clData), 'クラスター');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(top20), '優先度TOP20');

    XLSX.writeFile(wb, 'keyword-analysis.xlsx');
    closeExportModal();
    alert('Excelファイルをダウンロードしました（競合対策データ含む）');
}

// JSON出力
function exportJSON() {
    if (keywords.length === 0) { alert('データがありません'); return; }

    const data = {
        version: 'v4',
        exportedAt: new Date().toISOString(),
        keywords: keywords,
        clusters: clusters,
        competitorAnalysis: competitorHeadingsData
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'keyword-analysis-backup.json';
    a.click();
    closeExportModal();
    alert('JSONファイルをダウンロードしました（インポートで復元可能）');
}

// マークダウン出力
function exportMarkdown() {
    if (clusters.length === 0) { alert('データがありません'); return; }

    let md = `# SEOキーワード分析レポート\n\n`;
    md += `生成日: ${new Date().toLocaleDateString('ja-JP')}\n\n`;
    md += `## サマリー\n`;
    md += `- 総キーワード数: ${keywords.length}\n`;
    md += `- クラスター数: ${clusters.length}\n`;
    md += `- 高優先グループ: ${clusters.filter(c => c.priority >= 4).length}\n\n`;

    md += `## クラスター一覧\n\n`;
    clusters.forEach(c => {
        md += `### ${c.name}（優先度${c.priority}）\n`;
        md += `- キーワード数: ${c.keywords.length}\n`;
        md += `- CV期待度: ${c.cvExpect}%\n`;
        md += `- 主要キーワード:\n`;
        c.keywords.slice(0, 5).forEach(kw => {
            md += `  - ${kw.keyword} (Vol: ${kw.volume})\n`;
        });
        md += `\n`;
    });

    md += `## 優先度TOP20\n\n`;
    md += `| 順位 | キーワード | ボリューム | CV期待度 |\n`;
    md += `|------|-----------|-----------|----------|\n`;
    keywords.slice(0, 20).forEach((kw, i) => {
        md += `| ${i + 1} | ${kw.keyword} | ${kw.volume} | ${kw.cvExpect}% |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'keyword-analysis-report.md';
    a.click();
    closeExportModal();
    alert('マークダウンファイルをダウンロードしました');
}

// ========== v4: インポート機能 ==========
function openImportModal() {
    document.getElementById('import-modal').classList.remove('hidden');
    initImportDropzone();
}
function closeImportModal() {
    document.getElementById('import-modal').classList.add('hidden');
}

function initImportDropzone() {
    const dropzone = document.getElementById('import-dropzone');
    const fileInput = document.getElementById('import-file-input');
    if (!dropzone || !fileInput) return;

    dropzone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
        if (e.target.files.length > 0) handleImportFile(e.target.files[0]);
    };
    dropzone.ondragover = (e) => { e.preventDefault(); dropzone.classList.add('border-blue-500'); };
    dropzone.ondragleave = (e) => { e.preventDefault(); dropzone.classList.remove('border-blue-500'); };
    dropzone.ondrop = (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-blue-500');
        if (e.dataTransfer.files.length > 0) handleImportFile(e.dataTransfer.files[0]);
    };
}

function handleImportFile(file) {
    if (!file.name.endsWith('.json')) {
        alert('JSONファイルを選択してください');
        return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.keywords && data.clusters) {
                keywords = data.keywords;
                clusters = data.clusters;
                if (data.competitorAnalysis) {
                    competitorHeadingsData = data.competitorAnalysis;
                }
                renderAnalysisResult();
                goToStep(2);
                closeImportModal();
                alert(`インポート完了: ${keywords.length}キーワード, ${clusters.length}クラスター`);
            } else {
                alert('無効なファイル形式です');
            }
        } catch (err) {
            alert('ファイルの読み込みに失敗しました: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// ========== v4: クラスター編集機能 ==========
let editingClusters = [];

function openClusterEditModal() {
    if (clusters.length === 0) { alert('データがありません'); return; }
    editingClusters = JSON.parse(JSON.stringify(clusters)); // ディープコピー
    renderClusterEditUI();
    document.getElementById('cluster-edit-modal').classList.remove('hidden');
}

function closeClusterEditModal() {
    document.getElementById('cluster-edit-modal').classList.add('hidden');
}

function renderClusterEditUI() {
    const container = document.getElementById('cluster-edit-container');
    container.innerHTML = editingClusters.map((c, cIdx) => `
        <div class="border-2 rounded-xl p-3 cluster-drop-zone" data-cluster-idx="${cIdx}" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleDrop(event, ${cIdx})">
            <div class="flex justify-between items-center mb-2">
                <input type="text" class="font-semibold text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none" value="${c.name}" onchange="updateClusterName(${cIdx}, this.value)">
                <span class="text-xs bg-gray-100 px-2 py-1 rounded">${c.keywords.length}件</span>
            </div>
            <div class="space-y-1 max-h-48 overflow-y-auto">
                ${c.keywords.map((kw, kwIdx) => `
                    <div class="draggable-kw bg-gray-50 px-2 py-1 rounded text-sm flex justify-between items-center" draggable="true" ondragstart="handleDragStart(event, ${cIdx}, ${kwIdx})">
                        <span class="truncate">${kw.keyword}</span>
                        <span class="text-xs text-gray-400">${kw.volume}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

let draggedItem = null;

function handleDragStart(e, clusterIdx, keywordIdx) {
    draggedItem = { clusterIdx, keywordIdx };
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e, targetClusterIdx) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    if (!draggedItem || draggedItem.clusterIdx === targetClusterIdx) return;

    // キーワードを移動
    const kw = editingClusters[draggedItem.clusterIdx].keywords.splice(draggedItem.keywordIdx, 1)[0];
    kw.cluster = editingClusters[targetClusterIdx].name;
    editingClusters[targetClusterIdx].keywords.push(kw);

    draggedItem = null;
    renderClusterEditUI();
}

function updateClusterName(idx, newName) {
    const oldName = editingClusters[idx].name;
    editingClusters[idx].name = newName;
    editingClusters[idx].keywords.forEach(kw => {
        if (kw.cluster === oldName) kw.cluster = newName;
    });
}

function addCustomCluster() {
    const name = prompt('新しいクラスター名を入力:');
    if (name && name.trim()) {
        editingClusters.push({
            name: name.trim(),
            keywords: [],
            priority: 3,
            cvExpect: 50
        });
        renderClusterEditUI();
    }
}

function saveClusterEdits() {
    // 空のクラスターを削除
    editingClusters = editingClusters.filter(c => c.keywords.length > 0);

    // グローバル変数を更新
    clusters = editingClusters;
    keywords = [];
    clusters.forEach(c => {
        c.keywords.forEach(kw => keywords.push(kw));
    });

    // 再ソート
    keywords.sort((a, b) => {
        const scoreA = a.cvExpect * Math.log10(a.volume + 1);
        const scoreB = b.cvExpect * Math.log10(b.volume + 1);
        return scoreB - scoreA;
    });

    renderAnalysisResult();
    closeClusterEditModal();
    alert('クラスター編集を保存しました');
}

// ========== 初期化 ==========
window.onload = function() {
    // 記事構成生成ボタンのイベントリスナー
    const generateBtn = document.getElementById('generate-article-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            generateArticleDesign();
        });
    }

    try {
        const saved = localStorage.getItem('seo-keyword-tool-v4');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.keywords && data.keywords.length > 0) {
                if (confirm(`前回のデータ（${data.keywords.length}キーワード）を復元しますか？`)) {
                    keywords = data.keywords;
                    clusters = data.clusters;
                    renderAnalysisResult();
                    goToStep(2);
                }
            }
        }
    } catch (e) {}
};
