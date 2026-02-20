class Calculator {
    constructor() {
        // 计算器状态
        this.state = {
            input: '0',
            result: '0',
            operator: null,
            firstOperand: null,
            secondOperand: null,
            shouldResetInput: false
        };
        
        // 元素引用
        this.elements = {
            displayInput: document.getElementById('display-input'),
            displayResult: document.getElementById('display-result')
        };
        
        // 初始化音频上下文
        this.audioContext = null;
        this.initAudioContext();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始化显示
        this.updateDisplay();
    }
    
    initAudioContext() {
        // 初始化Web Audio API上下文
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
    }
    
    playNote(frequency, duration = 0.2) {
        // 播放指定频率的音符
        if (!this.audioContext) {
            this.initAudioContext();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playButtonSound() {
        // 播放按钮音效
        this.playNote(800, 0.1);
    }
    
    playNumberSound(number) {
        // 播放数字对应的钢琴声
        // 0对应do, 1对应re, 2对应mi, 以此类推
        const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
        const frequency = frequencies[parseInt(number)] || frequencies[0];
        this.playNote(frequency, 0.3);
    }
    
    bindEvents() {
        // 绑定按钮点击事件
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', () => {
                this.handleButtonClick(button.dataset.value);
            });
        });
        
        // 绑定键盘事件
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e.key);
        });
    }
    
    handleButtonClick(value) {
        switch (value) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.playNumberSound(value);
                this.handleNumberInput(value);
                break;
            case '.':
                this.playButtonSound();
                this.handleDecimalInput();
                break;
            case '+':
            case '-':
            case '*':
            case '/':
                this.playButtonSound();
                this.handleOperatorInput(value);
                break;
            case '=':
                this.playButtonSound();
                this.handleEqualsInput();
                break;
            case 'C':
                this.playButtonSound();
                this.handleClearInput();
                break;
            case 'Backspace':
                this.playButtonSound();
                this.handleBackspaceInput();
                break;
            case '%':
                this.playButtonSound();
                this.handlePercentInput();
                break;
        }
    }
    
    handleKeyPress(key) {
        // 处理键盘输入
        if (/[0-9]/.test(key)) {
            this.playNumberSound(key);
            this.handleNumberInput(key);
        } else if (key === '.') {
            this.playButtonSound();
            this.handleDecimalInput();
        } else if (['+', '-', '*', '/'].includes(key)) {
            this.playButtonSound();
            this.handleOperatorInput(key);
        } else if (key === 'Enter' || key === '=') {
            this.playButtonSound();
            this.handleEqualsInput();
        } else if (key === 'Escape') {
            this.playButtonSound();
            this.handleClearInput();
        } else if (key === 'Backspace') {
            this.playButtonSound();
            this.handleBackspaceInput();
        } else if (key === '%') {
            this.playButtonSound();
            this.handlePercentInput();
        }
    }
    
    handleNumberInput(number) {
        if (this.state.shouldResetInput) {
            this.state.input = number;
            this.state.shouldResetInput = false;
        } else {
            this.state.input = this.state.input === '0' ? number : this.state.input + number;
        }
        this.updateDisplay();
    }
    
    handleDecimalInput() {
        if (this.state.shouldResetInput) {
            this.state.input = '0.';
            this.state.shouldResetInput = false;
        } else if (!this.state.input.includes('.')) {
            this.state.input += '.';
        }
        this.updateDisplay();
    }
    
    handleOperatorInput(operator) {
        if (this.state.firstOperand === null) {
            this.state.firstOperand = parseFloat(this.state.input);
        } else if (!this.state.shouldResetInput) {
            this.state.secondOperand = parseFloat(this.state.input);
            this.calculateResult();
            this.state.firstOperand = parseFloat(this.state.result);
        }
        
        this.state.operator = operator;
        this.state.shouldResetInput = true;
        this.updateDisplay();
    }
    
    handleEqualsInput() {
        if (this.state.firstOperand !== null && !this.state.shouldResetInput) {
            this.state.secondOperand = parseFloat(this.state.input);
            this.calculateResult();
            // 将计算结果设置为新的firstOperand，以便后续运算使用
            this.state.firstOperand = parseFloat(this.state.result);
            this.state.operator = null;
            this.state.shouldResetInput = true;
        }
        this.updateDisplay();
    }
    
    handleClearInput() {
        this.state = {
            input: '0',
            result: '0',
            operator: null,
            firstOperand: null,
            secondOperand: null,
            shouldResetInput: false
        };
        this.updateDisplay();
    }
    
    handleBackspaceInput() {
        if (this.state.shouldResetInput) return;
        
        if (this.state.input.length > 1) {
            this.state.input = this.state.input.slice(0, -1);
        } else {
            this.state.input = '0';
        }
        this.updateDisplay();
    }
    
    handlePercentInput() {
        const value = parseFloat(this.state.input);
        this.state.input = (value / 100).toString();
        this.updateDisplay();
    }
    
    calculateResult() {
        let calculationResult;
        const first = this.state.firstOperand;
        const second = this.state.secondOperand;
        const op = this.state.operator;
        
        try {
            switch (op) {
                case '+':
                    calculationResult = first + second;
                    break;
                case '-':
                    calculationResult = first - second;
                    break;
                case '*':
                    calculationResult = first * second;
                    break;
                case '/':
                    if (second === 0) {
                        this.state.result = '错误';
                        return;
                    }
                    calculationResult = first / second;
                    break;
                default:
                    return;
            }
            
            // 处理结果格式化
            this.state.result = this.formatNumber(calculationResult);
        } catch (error) {
            this.state.result = '错误';
        }
    }
    
    formatNumber(number) {
        // 处理大数字和小数
        if (Math.abs(number) >= 1e10) {
            return number.toExponential(2);
        } else if (number % 1 !== 0) {
            // 最多显示10位小数，并添加千位分隔符
            const fixedNumber = parseFloat(number.toFixed(10));
            const parts = fixedNumber.toString().split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            return parts.join('.');
        } else {
            // 整数添加千位分隔符
            return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        }
    }
    
    updateDisplay() {
        this.elements.displayInput.textContent = this.state.operator 
            ? `${this.state.firstOperand || ''} ${this.state.operator} ${this.state.shouldResetInput ? '' : this.state.input}`
            : this.state.input;
        this.elements.displayResult.textContent = this.state.result;
    }
}

// 初始化计算器
window.addEventListener('DOMContentLoaded', () => {
    new Calculator();
});