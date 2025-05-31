export class Toast {
    private static toastCount = 0;

    static show(message: string, type: 'success' | 'error' = 'success'): void {
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'success' ? 'toast-success' : 'toast-error'}`;
        toast.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.textContent = '×';
        closeButton.className = 'toast-close';
        closeButton.addEventListener('click', () => toast.remove());
        toast.appendChild(closeButton);

        const offset = Toast.toastCount * 70; 
        toast.style.bottom = `${20 + offset}px`;
        toast.style.right = '20px';

        document.body.appendChild(toast);
        Toast.toastCount++;


        setTimeout(() => {
            toast.remove();
            Toast.toastCount = Math.max(0, Toast.toastCount - 1);
        }, 5000);
    }
}