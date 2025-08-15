declare module 'react-native-razorpay' {
    interface RazorpayOptions {
        description?: string;
        image?: string;
        currency?: string;
        key: string;
        amount: number;
        name?: string;
        prefill?: {
            email?: string;
            contact?: string;
            name?: string;
        };
        theme?: {
            color?: string;
        };
    }

    interface RazorpaySuccessResponse {
        razorpay_payment_id: string;
    }

    interface RazorpayFailureResponse {
        code: number;
        description: string;
        error: string;
        metadata: any;
        reason: string;
        step: string;
    }

    const RazorpayCheckout: {
        open(options: RazorpayOptions): Promise<RazorpaySuccessResponse>;
    };

    export default RazorpayCheckout;
}