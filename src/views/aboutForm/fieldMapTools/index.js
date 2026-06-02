
let currentJSConfig = {
    columnList: [
        { prop: 'applExpl', label: '申请说明1', width: 120, type: 'select', placeholder: '请选择流程类型',falg:true },

        { prop: 'processType', label: '流程类型', width: 120, type: 'select', placeholder: '请选择流程类型',falg:true },
        { prop: 'oaProcessNumber', label: 'OA流程单号', width: 150, type: 'input', placeholder: '请输入OA流程单号' },
        { prop: 'futuresFtpCode', label: '期货FTP编码', width: 120, type: 'input', placeholder: '请输入期货FTP编码' },
    ]
};

let excelData = null;
let apiFields = []; // 存储API字段信息 { name, description, type }
let currentMapping = {};

// 文件上传处理
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.xlsx,.xls';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0]);
});

// 处理Excel文件
function handleFile(file) {
    console.log('========== 开始处理文件 ==========');
    console.log('文件名:', file.name);
    console.log('文件大小:', file.size, 'bytes');
    console.log('文件类型:', file.type);
    
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log('文件读取完成，开始解析Excel...');
        
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        console.log('工作簿信息:', workbook.SheetNames);
        
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        console.log('第一个Sheet名称:', workbook.SheetNames[0]);
        
        // 转换为JSON，保留所有行
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' });
        
        console.log('转换后的JSON数据行数:', jsonData.length);
        console.log('前3行原始数据:');
        for (let i = 0; i < Math.min(3, jsonData.length); i++) {
            console.log(`  行${i}:`, jsonData[i]);
        }
        
        if (jsonData.length === 0) {
            console.error('Excel文件没有数据行');
            showNotification('Excel文件为空，请检查文件内容', 'error');
            return;
        }
        
        // 检查第一行是否包含applExpl
        const allText = JSON.stringify(jsonData);
        console.log('文件中是否包含"applExpl":', allText.includes('applExpl'));
        
        parseAPIDocument(jsonData);
        displayExcelPreview(jsonData);
        initializeMapping();
        
        document.getElementById('excelPreview').style.display = 'block';
        document.getElementById('mappingPanel').style.display = 'block';
    };
    
    reader.onerror = function(e) {
        console.error('文件读取失败:', e);
        showNotification('文件读取失败，请重试', 'error');
    };
    
    reader.readAsArrayBuffer(file);
    document.getElementById('fileInfo').innerHTML = `<p class="success">✅ 已加载: ${file.name}</p>`;
}

 
 // 解析API文档格式（字段名、字段说明、字段类型）- 超级调试版
 // 解析API文档格式（字段名、字段说明、字段类型）- 超级调试版
function parseAPIDocument(data) {
    apiFields = [];
    
    console.log('========== 开始解析Excel ==========');
    console.log('总行数:', data.length);
    console.log('原始数据前5行:', data.slice(0, 5));
    
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        
        console.log(`\n--- 处理第 ${i} 行 ---`);
        console.log('原始行数据:', row);
        console.log('行类型:', typeof row, '是否为数组:', Array.isArray(row));
        
        // 确保row存在
        if (!row) {
            console.log(`第 ${i} 行为空，跳过`);
            continue;
        }
        
        // 获取三个列的值
        let col0 = row[0] !== undefined && row[0] !== null ? String(row[0]) : '';
        let col1 = row[1] !== undefined && row[1] !== null ? String(row[1]) : '';
        let col2 = row[2] !== undefined && row[2] !== null ? String(row[2]) : '';
        
        console.log(`第1列(字段名): "${col0}"`);
        console.log(`第2列(说明): "${col1}"`);
        console.log(`第3列(类型): "${col2}"`);
        
        // 去除首尾空格
        let fieldName = col0.trim();
        let description = col1.trim();
        let type = col2.trim();
        
        console.log(`去除空格后 - 字段名: "${fieldName}", 说明: "${description}", 类型: "${type}"`);
        
        // 如果字段名为空，跳过
        if (!fieldName) {
            console.log(`⚠️ 第 ${i} 行字段名为空，跳过`);
            continue;
        }
        
        // 注释掉自动表头判断，改为手动控制
        // 如果需要跳过表头，请手动设置以下变量为 true
        const skipFirstRow = false; // 改为 true 则跳过第一行

        if (skipFirstRow && i === 0) {
            console.log(`跳过第一行`);
            continue;
        }
        
        // 如果类型为空，设置为默认值
        if (!type) {
            type = 'string';
            console.log(`类型为空，设置为默认值: string`);
        }
        
        // 添加到结果
        const field = {
            name: fieldName,
            description: description,
            type: type
        };
        
        apiFields.push(field);
        console.log(`✅ 成功解析字段:`, field);
    }
    
    console.log('\n========== 解析完成 ==========');
    console.log(`共解析到 ${apiFields.length} 个字段`);
    console.log('字段列表:', apiFields.map(f => f.name));
    
    if (apiFields.length === 0) {
        console.error('❌ 未解析到任何字段！请检查：');
        console.error('1. Excel文件是否包含数据');
        console.error('2. 第一列是否真的有字段名');
        console.error('3. 尝试重新保存Excel文件为.xlsx格式');
    }
    
    return apiFields;
}
// 显示Excel预览
function displayExcelPreview(data) {
    let html = `
        <div style="margin-bottom: 15px;">
            <p class="info">📌 API文档格式：字段名 | 字段说明 | 字段类型</p>
            <p>共解析到 <strong>${apiFields.length}</strong> 个API字段</p>
            <p class="info">🎯 将只匹配配置中的 <strong>${currentJSConfig.columnList.length}</strong> 个字段，多余字段不会出现在结果中</p>
            <p class="info">✨ 保留所有额外配置字段（type、placeholder、rules等）</p>
            <p class="info">🏷️ 保留JS原有的label（中文显示名），只替换prop为API字段名</p>
        </div>
        <div style="overflow-x: auto;">
            <table>
                <thead>
                    <tr>
                        <th>字段名</th>
                        <th>字段说明</th>
                        <th>字段类型</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    apiFields.slice(0, 20).forEach(field => {
        // 高亮显示配置中匹配的字段
        const isInConfig = currentJSConfig.columnList.some(item => 
            calculateSimilarity(item.prop, field.name) > 60 || item.prop === field.name
        );
        const highlightStyle = isInConfig ? 'background: #e8f5e9;' : '';
        
        html += `
            <tr style="${highlightStyle}">
                <td><code>${escapeHtml(field.name)}</code> ${isInConfig ? '🎯' : ''}</td>
                <td>${escapeHtml(field.description)}</td>
                <td><span class="similarity-badge">${escapeHtml(field.type)}</span></td>
            </tr>
        `;
    });
    
    if (apiFields.length > 20) {
        html += `<tr><td colspan="3" style="text-align: center;">... 还有 ${apiFields.length - 20} 个字段</td></tr>`;
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('excelTable').innerHTML = html;
}

// 改进的字符串相似度计算（更注重精确匹配）
function calculateSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const s1 = String(str1).toLowerCase().trim();
    const s2 = String(str2).toLowerCase().trim();
    
    // 完全匹配：100分
    if (s1 === s2) return 100;
    
    // 忽略大小写的完全相同：95分
    if (s1.toLowerCase() === s2.toLowerCase()) return 95;
    
    // 检查是否互为子串（但排除单个字符）
    if (s1.includes(s2) && s2.length > 2) {
        return 80 + (s2.length / s1.length) * 10;
    }
    if (s2.includes(s1) && s1.length > 2) {
        return 80 + (s1.length / s2.length) * 10;
    }
    
    // 分词匹配（驼峰命名和下划线分割）
    const tokens1 = tokenize(s1);
    const tokens2 = tokenize(s2);
    
    // 检查是否有完全匹配的词
    for (let token1 of tokens1) {
        for (let token2 of tokens2) {
            if (token1 === token2 && token1.length > 2) {
                return 70;
            }
        }
    }
    
    // 检查部分词匹配
    let matchCount = 0;
    for (let token1 of tokens1) {
        for (let token2 of tokens2) {
            if (token1.length > 2 && token2.length > 2 && (token1.includes(token2) || token2.includes(token1))) {
                matchCount++;
                break;
            }
        }
    }
    
    if (matchCount > 0) {
        const maxTokens = Math.max(tokens1.length, tokens2.length);
        return 50 + (matchCount / maxTokens) * 20;
    }
    
    // Levenshtein距离作为最后手段
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix = [];
    
    for (let i = 0; i <= len1; i++) matrix[i] = [i];
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    
    const maxLen = Math.max(len1, len2);
    const similarity = (1 - matrix[len1][len2] / maxLen) * 100;
    return Math.floor(similarity);
}

// 分词函数（支持驼峰、下划线、空格）
function tokenize(str) {
    // 先按下划线分割
    let parts = str.split(/[_\-]/);
    
    // 再按驼峰分割
    let tokens = [];
    parts.forEach(part => {
        // 分割驼峰命名
        const camelParts = part.split(/(?=[A-Z])/);
        camelParts.forEach(p => {
            if (p && p.length > 0) {
                tokens.push(p.toLowerCase());
            }
        });
    });
    
    return tokens;
}

// 改进的智能匹配算法
function autoMatch() {
    currentMapping = {};
    const usedApiFields = new Set(); // 防止一个API字段被多次匹配
    
    // 第一轮：精确匹配（完全相等或忽略大小写）
    currentJSConfig.columnList.forEach((item, index) => {
        let exactMatch = null;
        
        // 查找精确匹配
        for (let apiField of apiFields) {
            if (!usedApiFields.has(apiField.name)) {
                if (item.prop === apiField.name) {
                    exactMatch = apiField;
                    break;
                }
                if (item.prop.toLowerCase() === apiField.name.toLowerCase()) {
                    exactMatch = apiField;
                    break;
                }
            }
        }
        
        if (exactMatch) {
            currentMapping[item.prop] = {
                excelField: exactMatch.name,
                fieldInfo: exactMatch,
                similarity: 100,
                matchType: 'exact'
            };
            usedApiFields.add(exactMatch.name);
        }
    });
    
    // 第二轮：高相似度匹配（基于分词和说明）
    currentJSConfig.columnList.forEach((item, index) => {
        // 如果已经匹配成功，跳过
        if (currentMapping[item.prop]) return;
        
        let bestMatch = null;
        let bestScore = 0;
        let bestMatchInfo = null;
        
        for (let apiField of apiFields) {
            // 跳过已使用的字段
            if (usedApiFields.has(apiField.name)) continue;
            
            // 计算字段名相似度
            const nameScore = calculateSimilarity(item.prop, apiField.name);
            
            // 计算label与描述的相似度
            let descScore = 0;
            if (item.label && apiField.description) {
                descScore = calculateSimilarity(item.label, apiField.description);
            }
            
            // 计算label与字段名的相似度
            const labelToNameScore = calculateSimilarity(item.label, apiField.name);
            
            // 加权计算：字段名权重最高（0.6），说明次之（0.3），字段名与label匹配（0.1）
            let totalScore = nameScore * 0.6 + Math.max(descScore, labelToNameScore) * 0.4;
            
            // 如果字段名中有特殊关键词，提高匹配权重
            const propTokens = tokenize(item.prop);
            const nameTokens = tokenize(apiField.name);
            
            // 检查是否有共同的关键词
            let commonTokens = 0;
            for (let token of propTokens) {
                if (nameTokens.some(t => t === token || t.includes(token) || token.includes(t))) {
                    commonTokens++;
                }
            }
            
            if (commonTokens > 0) {
                totalScore += (commonTokens / Math.max(propTokens.length, nameTokens.length)) * 20;
            }
            
            // 如果字段名包含在对方中，增加分数
            if (item.prop.toLowerCase().includes(apiField.name.toLowerCase()) && apiField.name.length > 3) {
                totalScore += 15;
            }
            if (apiField.name.toLowerCase().includes(item.prop.toLowerCase()) && item.prop.length > 3) {
                totalScore += 15;
            }
            
            // 限制最高分100
            totalScore = Math.min(totalScore, 100);
            
            if (totalScore > bestScore && totalScore > 30) {
                bestScore = totalScore;
                bestMatch = apiField.name;
                bestMatchInfo = apiField;
            }
        }
        
        if (bestMatch) {
            currentMapping[item.prop] = {
                excelField: bestMatch,
                fieldInfo: bestMatchInfo,
                similarity: Math.floor(bestScore),
                matchType: bestScore >= 80 ? 'high' : (bestScore >= 60 ? 'medium' : 'low')
            };
            usedApiFields.add(bestMatch);
        } else {
            currentMapping[item.prop] = {
                excelField: '',
                fieldInfo: null,
                similarity: 0,
                matchType: 'none'
            };
        }
    });
    
    renderMappingTable();
    updateMatchStats();
}

// 渲染映射表格
function renderMappingTable() {
    const tbody = document.getElementById('mappingBody');
    tbody.innerHTML = '';
    
    currentJSConfig.columnList.forEach((item, index) => {
        const mapping = currentMapping[item.prop] || { excelField: '', fieldInfo: null, similarity: 0 };
        const similarityClass = mapping.similarity >= 80 ? 'high-match' : (mapping.similarity >= 60 ? 'medium-match' : '');
        
        const row = tbody.insertRow();
        row.insertCell(0).innerHTML = `<code>${escapeHtml(item.prop)}</code>`;
        
        // 显示额外的配置字段
        let extraConfig = [];
        if (item.type) extraConfig.push(`type: ${item.type}`);
        if (item.placeholder) extraConfig.push(`placeholder: ${item.placeholder}`);
        if (Object.keys(item).length > 3) {
            const otherKeys = Object.keys(item).filter(k => !['prop', 'label', 'width'].includes(k));
            extraConfig.push(...otherKeys.map(k => `${k}: ${JSON.stringify(item[k])}`));
        }
        const extraHtml = extraConfig.length > 0 ? `<div style="font-size: 11px; color: #888; margin-top: 4px;">📎 ${extraConfig.join(', ')}</div>` : '';
        row.insertCell(1).innerHTML = escapeHtml(item.label) + extraHtml;
        
        // 创建下拉选择框 - 优化显示
        const selectCell = row.insertCell(2);
        const select = document.createElement('select');
        select.className = 'select-mapping';
        select.setAttribute('data-prop', item.prop);
        select.style.minWidth = '250px'; // 增加最小宽度以显示更多内容
        select.onchange = function() {
            const selectedField = this.value;
            const fieldInfo = selectedField ? apiFields.find(f => f.name === selectedField) : null;
            let similarity = 0;
            let matchType = 'none';
            if (selectedField) {
                similarity = calculateSimilarity(item.prop, selectedField);
                matchType = similarity >= 80 ? 'high' : (similarity >= 60 ? 'medium' : 'low');
            }
            currentMapping[item.prop] = {
                excelField: selectedField,
                fieldInfo: fieldInfo,
                similarity: similarity,
                matchType: matchType
            };
            renderMappingTable();
            updateMatchStats();
        };
        
        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-- 不映射 --';
        select.appendChild(defaultOption);
        
        // 按匹配度排序API字段，让匹配度高的排在前面
        const sortedApiFields = [...apiFields].sort((a, b) => {
            // 如果当前字段有匹配的，优先显示
            if (a.name === mapping.excelField) return -1;
            if (b.name === mapping.excelField) return 1;
            
            // 否则按相似度排序
            const scoreA = calculateSimilarity(item.prop, a.name);
            const scoreB = calculateSimilarity(item.prop, b.name);
            return scoreB - scoreA;
        });
        
        // 添加API字段选项，显示完整信息
        sortedApiFields.forEach(apiField => {
            const option = document.createElement('option');
            option.value = apiField.name;
            
            // 构建显示文本：字段名 | 中文说明 | 类型
            let displayText = apiField.name;
            if (apiField.description && apiField.description.trim()) {
                // 限制说明长度，避免下拉框过宽
                const desc = apiField.description.length > 30 
                    ? apiField.description.substring(0, 27) + '...' 
                    : apiField.description;
                displayText += ` | ${desc}`;
            }
            if (apiField.type) {
                displayText += ` | [${apiField.type}]`;
            }
            
            option.textContent = displayText;
            
            // 添加title属性，鼠标悬停时显示完整信息
            let titleText = `字段名: ${apiField.name}`;
            if (apiField.description) titleText += `\n说明: ${apiField.description}`;
            if (apiField.type) titleText += `\n类型: ${apiField.type}`;
            option.title = titleText;
            
            // 如果是当前匹配的字段，添加选中状态
            if (apiField.name === mapping.excelField) {
                option.selected = true;
            }
            
            // 计算相似度并添加样式提示（可选）
            const similarity = calculateSimilarity(item.prop, apiField.name);
            if (similarity >= 70 && !option.selected) {
                option.style.backgroundColor = '#e8f5e9';
                option.style.fontWeight = '500';
            }
            
            select.appendChild(option);
        });
        
        selectCell.appendChild(select);
        
        // 显示匹配度和字段说明
        let infoHtml = `<span class="similarity-badge ${similarityClass}">${mapping.similarity}%</span>`;
        if (mapping.matchType === 'exact') {
            infoHtml += `<span style="margin-left: 5px; color: #28a745;">✓ 精确匹配</span>`;
        }
        if (mapping.fieldInfo && mapping.fieldInfo.description) {
            infoHtml += `<div style="font-size: 12px; color: #666; margin-top: 5px;">📝 ${escapeHtml(mapping.fieldInfo.description.substring(0, 50))}</div>`;
            infoHtml += `<div style="font-size: 11px; color: #999;">🔤 类型: ${escapeHtml(mapping.fieldInfo.type)}</div>`;
        } else if (!mapping.excelField) {
            infoHtml += `<div style="font-size: 11px; color: #ff6b6b; margin-top: 5px;">⚠️ 未匹配，请手动选择</div>`;
        }
        row.insertCell(3).innerHTML = infoHtml;
    });
}

// 更新匹配统计
function updateMatchStats() {
    const matchedCount = currentJSConfig.columnList.filter(item => {
        const mapping = currentMapping[item.prop];
        return mapping && mapping.excelField;
    }).length;
    
    const exactMatchCount = currentJSConfig.columnList.filter(item => {
        const mapping = currentMapping[item.prop];
        return mapping && mapping.matchType === 'exact';
    }).length;
    
    const statsHtml = `
        <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 5px;">
            <strong>📊 匹配统计：</strong><br/>
            ✅ 已匹配: ${matchedCount}/${currentJSConfig.columnList.length} 个字段<br/>
            🎯 精确匹配: ${exactMatchCount} 个<br/>
            ✨ 将保留所有额外配置字段（type、placeholder等）<br/>
            🏷️ 将保留JS原有的label（中文显示名）<br/>
            ${matchedCount === currentJSConfig.columnList.length ? '🎉 全部匹配完成！' : ''}
            ${matchedCount < currentJSConfig.columnList.length ? '⚠️ 请手动匹配未完成的字段' : ''}
        </div>
    `;
    
    // 更新预览区域的统计
    const excelTable = document.getElementById('excelTable');
    if (excelTable) {
        const existingStats = excelTable.querySelector('.match-stats');
        if (existingStats) {
            existingStats.innerHTML = statsHtml;
        } else {
            const statsDiv = document.createElement('div');
            statsDiv.className = 'match-stats';
            statsDiv.innerHTML = statsHtml;
            excelTable.appendChild(statsDiv);
        }
    }
}

// 初始化映射
function initializeMapping() {
    autoMatch();
}

// 应用映射并生成代码（保留JS原有的label）
function applyMapping() {
    const newColumnList = [];
    
    // 只处理columnList中配置的字段
    currentJSConfig.columnList.forEach(jsItem => {
        const mapping = currentMapping[jsItem.prop];
        
        // 创建新对象，复制所有原始字段
        const newItem = { ...jsItem };
        
        if (mapping && mapping.excelField && mapping.fieldInfo) {
            // 成功匹配到API字段，只更新prop，保留原有的label
            newItem.prop = mapping.excelField;
            // 注意：不修改label，保留JS原有的label
            // newItem.label 保持不变，还是原来的中文显示名
            
            // 添加匹配元数据（可选，用于调试）
            newItem._matchInfo = {
                originalProp: jsItem.prop,
                apiFieldName: mapping.excelField,
                apiDescription: mapping.fieldInfo.description,
                fieldType: mapping.fieldInfo.type,
                matchScore: mapping.similarity,
                matchType: mapping.matchType,
                note: 'prop已替换为API字段名，label保持原JS配置'
            };
        } else {
            // 未匹配的字段，保留原配置但标记
            newItem._matchInfo = {
                note: '⚠️ 未匹配到API字段，请手动确认'
            };
        }
        
        newColumnList.push(newItem);
    });
    
    // 生成基础配置（移除_matchInfo元数据）
    const baseConfig = {
        columnList: newColumnList.map(({ _matchInfo, ...item }) => item)
    };
    
    // 生成详细配置（包含元数据）
    const detailedConfig = {
        columnList: newColumnList,
        summary: {
            totalFields: currentJSConfig.columnList.length,
            mappedFields: newColumnList.filter(f => !f._matchInfo?.note).length,
            exactMatches: newColumnList.filter(f => f._matchInfo?.matchType === 'exact').length,
            highMatches: newColumnList.filter(f => f._matchInfo?.matchType === 'high').length,
            unmatchedFields: newColumnList.filter(f => f._matchInfo?.note).length,
            generatedAt: new Date().toLocaleString(),
            note: 'prop已替换为API字段名，label保留JS原始配置'
        }
    };
    
    const generatedCode = `// ============================================
// 从API文档生成的配置代码
// 生成时间: ${new Date().toLocaleString()}
// ============================================
// 说明：
// 1. 只包含 columnList 中配置的 ${currentJSConfig.columnList.length} 个字段
// 2. Excel中的其他字段未包含在此配置中
// 3. ✨ prop 已替换为API文档中的字段名
// 4. 🏷️ label 保留JS原有的中文显示名（未使用API文档的说明）
// 5. ✨ 保留了所有原始额外配置字段（type、placeholder、rules等）
// ============================================

// 基础配置（仅包含业务字段，已移除元数据）
const columnList = ${JSON.stringify(baseConfig.columnList, null, 4)};

// 详细配置（包含类型、说明、匹配信息等完整数据）
const detailedColumnList = ${JSON.stringify(detailedConfig.columnList, null, 4)};

// 配置摘要
const configSummary = ${JSON.stringify(detailedConfig.summary, null, 4)};

export { columnList, detailedColumnList, configSummary };

// ============================================
// 使用示例：
// ============================================
/*
// 在Vue组件中使用
import { columnList } from './columnConfig';

export default {
  data() {
    return {
      columns: columnList  // prop是API字段名，label是中文显示名
    }
  }
}

// 查看匹配详情
import { detailedColumnList, configSummary } from './columnConfig';
console.log('匹配摘要:', configSummary);
console.log('详细匹配信息:', detailedColumnList);

// 注意：
// - prop: 已替换为API字段名（用于数据绑定）
// - label: 保留JS原有配置（用于表格显示）
// - 所有额外字段（type、placeholder等）都已保留
*/
`;
    
    document.getElementById('outputCode').textContent = generatedCode;
    document.getElementById('outputArea').style.display = 'block';
    document.getElementById('outputArea').scrollIntoView({ behavior: 'smooth' });
    
    // 显示成功消息
    const summary = detailedConfig.summary;
    const extraFieldsCount = currentJSConfig.columnList.filter(item => 
        Object.keys(item).some(k => !['prop', 'label', 'width'].includes(k))
    ).length;
    
    showNotification(
        `✅ 生成成功！已匹配 ${summary.mappedFields} 个字段，prop已替换，label保持原样，保留了 ${extraFieldsCount} 个字段的额外配置`,
        'success'
    );
}

// 复制到剪贴板
function copyToClipboard() {
    const code = document.getElementById('outputCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showNotification('✅ 代码已复制到剪贴板', 'success');
    }).catch(() => {
        showNotification('❌ 复制失败，请手动复制', 'error');
    });
}

// 显示通知
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 450px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// HTML转义
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// 工具初始化完成
console.log('✅ API文档字段映射工具已就绪（保留JS原有label）');
console.log('📌 请上传格式为 [字段名 | 字段说明 | 字段类型] 的Excel文件');
console.log(`📌 当前配置了 ${currentJSConfig.columnList.length} 个字段`);
console.log('📌 匹配规则：只替换prop，保留JS原有的label和所有额外配置');




// 手动测试解析函数
const testData = [
    ['applExpl', '申请说明', 'string'],
    ['processType', '流程的类型1', 'string'],
    [],
    ['OANo', 'OA流程单号1', 'string'],
    [],
    ['ftpCode', '期货的FTP编码1', 'string'],
    [],
    ['id', '主键', 'interger']
];

console.log('测试数据:', testData);
parseAPIDocument(testData);