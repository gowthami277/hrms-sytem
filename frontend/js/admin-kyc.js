// Replace the internal logic of renderKycWithDocuments with this:
for (const emp of employees) {
    const docs = kycData[emp.id] || []; // Use pre-loaded data
    const docTypes = ['Aadhaar Card', 'PAN Card', 'Passport'];
    let docsHtml = '';

    for (const type of docTypes) {
        const doc = docs.find(d => d.documentType === type);
        if (doc) {
            docsHtml += `
                <div class="kyc-doc-row">
                    <span>✅ ${type}</span>
                    <div style="display:flex;gap:4px;">
                        <button class="btn-sm view-btn" onclick="viewKycDocument('${doc._id}')">View</button>
                        <button class="btn-sm del-btn" onclick="deleteKycDocumentConfirm('${doc._id}', '${emp.id}')">Delete</button>
                    </div>
                </div>`;
        } else {
            docsHtml += `
                <div class="kyc-doc-row">
                    <span>⬜ ${type}</span>
                    <button class="btn-sm upload-btn" onclick="openKycModalWithType('${emp.id}', '${type}')">Upload</button>
                </div>`;
        }
    }
    // ... rest of your HTML building logic
}