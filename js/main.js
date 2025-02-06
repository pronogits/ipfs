class IPFSGatewayTester {
    constructor() {
        this.gateways = [
            'https://gateway.pinata.cloud',
            'https://ipfs.trivium.network',
            'https://xnyiaslj9tfyt1m0-ipfs.ensusercontent.com',
            'https://ipfs-internal.xnftdata.com',
            'https://ipfs.funil.de',
            'https://ipfs.backend.prop.house',
            'https://d39z2iu8gx3qxr.cloudfront.net',
            'https://ipfs.allgram.best',
            'https://ipfs0.quantumindigo.org',
            'https://ipfs-gateway-2.omniflix.studio',
            'https://ipns.owo.systems',
            'https://gateway.ipfs.dxos.network',
            'https://ipfs.wax.bountyblok.io',
            'https://ipfs.hotdao.ai',
            // 添加更多网关
        ];

        this.testCID = 'bafybeieztd2i26injd7at3tmo4yhuqrwhhl45ozzkxu4v4tanumfnxditu'; // 用于测试的小文件CID
        this.results = [];
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.statusElement = document.getElementById('testing-status');
        this.startTestButton = document.getElementById('start-test');
        this.resultsBody = document.getElementById('results-body');
        this.gatewaySelect = document.getElementById('gateway-select');
        this.cidInput = document.getElementById('cid-input');
        this.filenameInput = document.getElementById('filename-input');
        this.downloadButton = document.getElementById('download-btn');
    }

    attachEventListeners() {
        this.startTestButton.addEventListener('click', () => this.startSpeedTest());
        this.downloadButton.addEventListener('click', () => this.downloadFile());
    }

    async startSpeedTest() {
        this.setUILoading(true);
        this.clearResults();
        this.statusElement.textContent = '正在测试网关速度...';

        const tests = this.gateways.map(gateway => this.testGateway(gateway));
        try {
            await Promise.all(tests);
            this.results.sort((a, b) => a.speed - b.speed);
            this.updateUI();
            this.statusElement.textContent = '测速完成！';
        } catch (error) {
            this.statusElement.textContent = '测速过程中发生错误！';
            console.error('Speed test error:', error);
        }
        this.setUILoading(false);
    }

    async testGateway(gateway) {
        const startTime = Date.now();
        try {
            const response = await fetch(`${gateway}/ipfs/${this.testCID}`, {
                method: 'HEAD',
                mode: 'no-cors'
            });
            const endTime = Date.now();
            const speed = endTime - startTime;

            this.results.push({
                gateway,
                speed,
                status: 'success'
            });
        } catch (error) {
            this.results.push({
                gateway,
                speed: Infinity,
                status: 'error'
            });
        }
    }

    updateUI() {
        // 更新结果表格
        this.resultsBody.innerHTML = '';
        this.gatewaySelect.innerHTML = '';

        this.results.forEach(result => {
            // 添加到表格
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.gateway}</td>
                <td>${result.speed === Infinity ? 'N/A' : result.speed + 'ms'}</td>
                <td class="status-${result.status}">
                    ${result.status === 'success' ? '✓' : '✗'}
                </td>
            `;
            this.resultsBody.appendChild(row);

            // 添加到下拉选择框
            if (result.status === 'success') {
                const option = document.createElement('option');
                option.value = result.gateway;
                option.textContent = `${result.gateway} (${result.speed}ms)`;
                this.gatewaySelect.appendChild(option);
            }
        });
    }

    downloadFile() {
        const gateway = this.gatewaySelect.value;
        const cid = this.cidInput.value.trim();
        const filename = this.filenameInput.value.trim();

        if (!gateway || !cid) {
            alert('请选择网关并输入CID！');
            return;
        }

        const url = `${gateway}/ipfs/${cid}${filename ? '/' + filename : ''}`;
        window.open(url, '_blank');
    }

    setUILoading(loading) {
        this.startTestButton.disabled = loading;
        if (loading) {
            this.startTestButton.innerHTML = '<span class="spinner-border"></span> 测试中...';
        } else {
            this.startTestButton.textContent = '开始测速';
        }
    }

    clearResults() {
        this.results = [];
        this.resultsBody.innerHTML = '';
        this.gatewaySelect.innerHTML = '';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new IPFSGatewayTester();
});
