// 默认的JS配置（支持额外字段）
let currentJSConfig = {
    columnList: [
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
    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        
        if (jsonData.length > 0) {
            parseAPIDocument(jsonData);
            displayExcelPreview(jsonData);
            initializeMapping();
            document.getElementById('excelPreview').style.display = 'block';
            document.getElementById('mappingPanel').style.display = 'block';
        }
    };
    reader.readAsArrayBuffer(file);
    document.getElementById('fileInfo').innerHTML = `<p class="success">✅ 已加载: ${file.name}</p>`;
}

// 解析API文档格式（字段名、字段说明、字段类型）
function parseAPIDocument(data) {
    apiFields = [];
    
    // 跳过表头（如果有的话）
    let startRow = 0;
    if (data.length > 0) {
        const firstRow = data[0];
        // 检查第一行是否是表头
        if (firstRow[0] && (firstRow[0].includes('字段') || firstRow[1].includes('说明') || firstRow[2].includes('类型'))) {
            startRow = 1;
        }
    }
    
    // 解析每一行
    for (let i = startRow; i < data.length; i++) {
        const row = data[i];
        if (row && row[0] && row[0].trim()) {
            apiFields.push({
                name: String(row[0]).trim(),
                description: row[1] ? String(row[1]).trim() : '',
                type: row[2] ? String(row[2]).trim() : 'string'
            });
        }
    }
    
    console.log('解析到的API字段：', apiFields);
    console.log(`共解析到 ${apiFields.length} 个API字段，将只匹配配置的 ${currentJSConfig.columnList.length} 个字段`);
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
        
        // 创建下拉选择框
        const selectCell = row.insertCell(2);
        const select = document.createElement('select');
        select.className = 'select-mapping';
        select.setAttribute('data-prop', item.prop);
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
        
        select.appendChild(new Option('-- 不映射 --', ''));
        apiFields.forEach(apiField => {
            const option = new Option(`${apiField.name} (${apiField.type})`, apiField.name);
            if (apiField.name === mapping.excelField) option.selected = true;
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