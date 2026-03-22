import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../supabase';

export default function ChatScreen({ route }) {
    const { role, requestId } = route.params;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    
    // Mock user IDs
    const myId = role === 'student' ? 'u1111111-1111-1111-1111-111111111111' : 'u2222222-2222-2222-2222-222222222222';

    useEffect(() => {
        if (!requestId) return;

        const fetchMessages = async () => {
            const { data } = await supabase.from('messages').select('*').eq('request_id', requestId).order('created_at', { ascending: true });
            if (data) setMessages(data);
        };
        fetchMessages();

        const sub = supabase.channel(`chat_${requestId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `request_id=eq.${requestId}` }, 
            (payload) => {
                setMessages(prev => [...prev, payload.new]);
            }).subscribe();

        return () => supabase.removeChannel(sub);
    }, [requestId]);

    const sendMessage = async () => {
        if (!message.trim()) return;
        
        await supabase.from('messages').insert([
            { request_id: requestId, sender_id: myId, content: message }
        ]);

        setMessage('');
    };

    const renderMessage = ({ item }) => {
        const isMe = item.sender_id === myId;
        return (
            <View style={[styles.msgBubble, isMe ? styles.msgRight : styles.msgLeft]}>
                <Text style={{ color: isMe ? 'white' : '#0f172a' }}>{item.content}</Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <FlatList
                data={messages}
                keyExtractor={item => item.id}
                renderItem={renderMessage}
                contentContainerStyle={{ padding: 20 }}
            />
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder="Type a message..."
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8fafc' },
    msgBubble: { padding: 12, borderRadius: 15, maxWidth: '80%', marginBottom: 10 },
    msgLeft: { backgroundColor: '#e2e8f0', alignSelf: 'flex-start', borderBottomLeftRadius: 0 },
    msgRight: { backgroundColor: '#3b82f6', alignSelf: 'flex-end', borderBottomRightRadius: 0 },
    inputRow: { flexDirection: 'row', padding: 10, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e2e8f0' },
    input: { flex: 1, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
    sendBtn: { backgroundColor: '#3b82f6', justifyContent: 'center', paddingHorizontal: 20, borderRadius: 20 }
});
