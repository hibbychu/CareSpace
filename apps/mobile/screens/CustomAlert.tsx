import React, { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

type AlertType = "success" | "error" | "info" | "warning";

interface CustomAlertProps {
    message: string;
    visible: boolean;
    onHide: () => void;
    duration?: number;
    type?: AlertType;
}

const colors: Record<AlertType, { bg: string; text: string }> = {
    success: { bg: "#4caf50", text: "#fff" },
    error: { bg: "#e53935", text: "#fff" },
    info: { bg: "#2196f3", text: "#fff" },
    warning: { bg: "#ff9800", text: "#000" },
};

const CustomAlert: React.FC<CustomAlertProps> = ({
    message,
    visible,
    onHide,
    duration = 3000,
    type = "info",
}) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                setTimeout(() => {
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(onHide);
                }, duration);
            });
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={{
                position: "absolute",
                bottom: 80,
                left: 20,
                right: 20,
                padding: 14,
                borderRadius: 8,
                backgroundColor: colors[type].bg,
                opacity,
            }}
        >
            <Text style={{ color: colors[type].text, textAlign: "center" }}>
                {message}
            </Text>
        </Animated.View>
    );
};

export default CustomAlert;
