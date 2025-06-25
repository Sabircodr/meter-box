// Notification Manager
class NotificationManager {
    static show(message, type = 'info', duration = 4000) {
        // Remove any existing notification
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();

        // Icon based on type
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };

        // Create new notification
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.innerHTML = `<span style="margin-right: 0.5rem;">${icons[type] || 'ℹ️'}</span>${message}`;

        // Apply styles directly
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            font-size: 1rem;
            font-weight: 600;
            color: #fff;
            z-index: 10000;
            max-width: 320px;
            display: flex;
            align-items: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            background-color: ${
                type === 'success' ? 'rgba(40, 167, 70, 0.95)' :
                type === 'error' ? 'rgba(237, 80, 96, 0.95)' :
                type === 'warning' ? 'rgba(203, 172, 77, 0.95)' :
                'rgba(50, 149, 254, 0.95);'
            };
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.4s ease, transform 0.4s ease;
        `;

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Animate out after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 400); // match transition time
        }, duration);
    }
}

// Theme Management Class
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.currentTheme = this.getInitialTheme();
        this.init();
    }

    getInitialTheme() {
        // Check if user has a saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        // Default to light theme
        return 'light';
    }

    init() {
        this.setTheme(this.currentTheme);
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't manually set a preference
                if (!localStorage.getItem('theme')) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const icon = this.themeToggle.querySelector('i');
        if (this.currentTheme === 'dark') {
            icon.className = 'fas fa-moon';
        } else {
            icon.className = 'fas fa-sun';
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
}

// Calculator Class
class MeterCalculator {
    constructor() {
        this.form = document.getElementById('calculatorForm');
        this.resetBtn = document.getElementById('resetBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.init();
    }

init() {
    console.log("Initializing MeterCalculator...");

    console.log("Form element:", this.form);
    console.log("Reset button:", this.resetBtn);

    if (!this.form) {
        console.error("calculatorForm element not found in the DOM.");
        return;
    }

    if (!this.resetBtn) {
        console.error("resetBtn element not found in the DOM.");
        return;
    }

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    this.resetBtn.addEventListener('click', () => this.resetCalculator());
    this.setCurrentDate();
}

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('currentDate').value = today;
    }

handleSubmit(e) {
    e.preventDefault();
    console.log("Submit button pressed — form submitted!");
    
    const formData = this.getFormData();
    if (!this.validateInputs(formData)) {
        return;
    }

    const calculations = this.calculateUsage(formData);
    this.displayResults(calculations);
    this.showResults();
}


    getFormData() {
        return {
            previousReading: parseFloat(document.getElementById('previousReading').value),
            currentReading: parseFloat(document.getElementById('currentReading').value),
            previousDate: new Date(document.getElementById('previousDate').value),
            currentDate: new Date(document.getElementById('currentDate').value),
            ratePerUnit: parseFloat(document.getElementById('ratePerUnit').value)
        };
    }

    validateInputs(data) {
        if (data.currentReading <= data.previousReading) {
            NotificationManager.show('Current reading must be greater than previous reading', 'warning');
            return false;
        }

        else if (data.currentDate <= data.previousDate) {
            NotificationManager.show('Current date must be after previous date', 'warning');            
            return false;
        }

        else if (data.ratePerUnit <= 0) {
            NotificationManager.show('Rate per unit must be greater than 0', 'warning');                        
            return false;
        }

        else{
            NotificationManager.show('Calculating.......', 'success');                                   
        }

        return true;
    }

    calculateUsage(data) {
        const totalUnits = data.currentReading - data.previousReading;
        const totalCost = totalUnits * data.ratePerUnit;
                
        const previous = new Date(data.previousDate);
        const current = new Date(data.currentDate);

        let years = current.getFullYear() - previous.getFullYear();
        let months = current.getMonth() - previous.getMonth();
        let days = current.getDate() - previous.getDate();

        // Adjust if days are negative
        if (days < 0) {
            months -= 1;
            const prevMonth = new Date(current.getFullYear(), current.getMonth(), 0); // Last day of previous month
            days += prevMonth.getDate();
        }

        // Adjust if months are negative
        if (months < 0) {
            years -= 1;
            months += 12;
        }

        // Calculate full days difference as before (for cost division)
        const timeDiff = current.getTime() - previous.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // For weeks + days
        const weeks = Math.floor(daysDiff / 7);
        const remainingDays = daysDiff % 7;

        
        // Calculate daily averages
        const dailyUsage = totalUnits / daysDiff;
        const dailyCost = totalCost / daysDiff;
        
        // Calculate estimates
        const weeklyUsage = dailyUsage * 7;
        const weeklyCost = dailyCost * 7;
        const monthlyUsage = dailyUsage * 30;
        const monthlyCost = dailyCost * 30;

        return {
            totalUnits: totalUnits.toFixed(2),
            totalCost: totalCost.toFixed(2),
            dailyUsage: dailyUsage.toFixed(2),
            dailyCost: dailyCost.toFixed(2),
            weeklyUsage: weeklyUsage.toFixed(2),
            weeklyCost: weeklyCost.toFixed(2),
            monthlyUsage: monthlyUsage.toFixed(2),
            monthlyCost: monthlyCost.toFixed(2),
            billingPeriod: daysDiff,
            billingBreakdown: {
                years,
                months,
                days,
                weeks,
                remainingDays
            }
        };
    }

    displayResults(calculations) {
        document.getElementById('totalUnits').textContent = `${calculations.totalUnits} kWh`;
        document.getElementById('totalCost').textContent = `₹${calculations.totalCost}`;
        
        document.getElementById('dailyUsage').textContent = `${calculations.dailyUsage} kWh`;
        document.getElementById('dailyCost').textContent = `₹${calculations.dailyCost}/day`;
        
        document.getElementById('weeklyUsage').textContent = `${calculations.weeklyUsage} kWh`;
        document.getElementById('weeklyCost').textContent = `₹${calculations.weeklyCost}/week`;
        
        document.getElementById('monthlyUsage').textContent = `${calculations.monthlyUsage} kWh`;
        document.getElementById('monthlyCost').textContent = `₹${calculations.monthlyCost}/month`;
        
        document.getElementById('billingPeriod').textContent = `${calculations.billingPeriod} days`;

        // Show formatted breakdown
        const { years, months, days, weeks, remainingDays } = calculations.billingBreakdown;
        const breakdown = [];

        if (years > 0 || months > 0 || days > 0) {
            breakdown.push(`${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}, ${days} day${days !== 1 ? 's' : ''}`);
        }

        breakdown.push(`${weeks} week${weeks !== 1 ? 's' : ''}, ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`);

        const breakdownElement = document.getElementById('billingBreakdown');
        if (breakdownElement) {
            breakdownElement.innerHTML = breakdown
                .map(line => `<div class="billing-subtext">${line}</div>`)
                .join('');
        }

    }

    showResults() {
        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    resetCalculator() {
        // Reset form
        this.form.reset();
        
        // Hide results
        this.resultsSection.style.display = 'none';
        
        // Reset current date
        this.setCurrentDate();
        
        // Clear stored data
        this.clearStoredData();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    clearStoredData() {
        // Clear any localStorage data related to calculations
        localStorage.removeItem('meterCalculations');
        localStorage.removeItem('lastCalculation');
    }
}

// Mobile App Download Handler
class appDownloadHandler {
    constructor() {
        this.downloadBtn = document.getElementById('downloadApp');
        this.appFileUrl = '/downloads/meter-tracker-app.apk'; // Update path if needed
        this.appIsReady = true; // Set to false if app is not yet available
        this.init();
    }

    init() {
        if (!this.downloadBtn) return;
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
    }

    async handleDownload() {

        if (!this.appIsReady) {
            NotificationManager.show('📱 The mobile app is coming soon!', 'info');
            return;
        }

        if (!this.isMobileDevice()) {
            NotificationManager.show('Please use a mobile device to download the app.', 'warning');
            return;
        }

        const confirmDownload = confirm('Are you sure you want to download the Meter Tracker mobile app?');
        if (!confirmDownload) return;

        try {
            const response = await fetch(this.appFileUrl, { method: 'HEAD' });
            if (!response.ok) throw new Error('Download file not found');

            this.triggerDownload(this.appFileUrl);
            NotificationManager.show('📥 Download starting...', 'success');
        } catch (error) {
            console.error(error);
            NotificationManager.show('❌ Error: App file missing or download failed.', 'error');
        }
    }

    triggerDownload(fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = '';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    isMobileDevice() {
        return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
    }
}

// Utility Functions
class Utils {
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }

    static animateValue(element, start, end, duration = 1000) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = start + (end - start) * easeOutQuart;
            
            element.textContent = Math.round(current * 100) / 100;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Form Validation Class
class FormValidator {
    static validateNumber(value, min = 0, max = Infinity) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }

    static validateDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        return date instanceof Date && !isNaN(date) && date <= now;
    }

    static validateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return start < end;
    }

    static showError(message, element = null) {
        // Create or update error message
        let errorDiv = document.querySelector('.error-message');
        
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
                border-radius: 4px;
                padding: 0.75rem;
                margin: 1rem 0;
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 300px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(errorDiv);
        }

        errorDiv.textContent = message;
        errorDiv.style.display = 'block';

        // Remove error message after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

// Main Application Class
class MeterTrackerApp {
    constructor() {
        this.themeManager = new ThemeManager();
        this.calculator = new MeterCalculator();
        this.appDownloadHandler = new appDownloadHandler();
        this.init();
    }

    init() {
        // Add loading animation to buttons
        this.addButtonLoadingStates();
        
        // Add smooth scrolling
        this.enableSmoothScrolling();
        
        // Add keyboard shortcuts
        this.addKeyboardShortcuts();
        
        // Initialize tooltips
        this.initializeTooltips();
        
        console.log('Meter Tracker App initialized successfully!');
    }

    addButtonLoadingStates() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                if (this.type === 'submit') {
                    const originalText = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
                    setTimeout(() => {
                        this.innerHTML = originalText;
                    }, 2000);
                }
            });
        });
    }


    enableSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    addKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + Enter to submit form
            if (e.ctrlKey && e.key === 'Enter') {
                const form = document.getElementById('calculatorForm');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
            
            // Ctrl + R to reset (prevent default browser refresh)
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.calculator.resetCalculator();
            }
            
            // T to toggle theme
            if (e.key === 't' || e.key === 'T') {
                if (!e.target.matches('input, textarea')) {
                    this.themeManager.toggleTheme();
                }
            }
        });
    }

    initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[aria-label]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', this.showTooltip);
            element.addEventListener('mouseleave', this.hideTooltip);
        });
    }

    showTooltip(e) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = e.target.getAttribute('aria-label');
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.875rem;
            white-space: nowrap;
            z-index: 1000;
            pointer-events: none;
        `;
        
        document.body.appendChild(tooltip);
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.bottom + 10 + 'px';
        
        e.target.tooltip = tooltip;
    }

    hideTooltip(e) {
        if (e.target.tooltip) {
            document.body.removeChild(e.target.tooltip);
            delete e.target.tooltip;
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new MeterTrackerApp();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Save any unsaved data when user switches tabs
        console.log('Page hidden - saving state...');
    } else {
        // Refresh data when user returns
        console.log('Page visible - refreshing...');
    }
});

// Handle online/offline status
window.addEventListener('online', () => {
    console.log('Connection restored');
});

window.addEventListener('offline', () => {
    console.log('Connection lost - working offline');
});