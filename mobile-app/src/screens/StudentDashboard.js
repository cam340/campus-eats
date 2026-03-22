import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Button, ScrollView, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase';

// Needs @react-native-picker/picker in actual setup, mocked here for logic display
const PickerMock = ({ selectedValue, onValueChange, children }) => (
    <View style={styles.pickerContainer}>
        <Text style={{padding: 12, color: '#334155'}}>{selectedValue}</Text>
    </View>
);

export default function StudentDashboard({ navigation }) {
    const [request, setRequest] = useState('');
    const [budget, setBudget] = useState('');
    const [locationId, setLocationId] = useState('');
    const [activeOrder, setActiveOrder] = useState(null);
    const [locations, setLocations] = useState([]);

    // Fetch Admin-defined Locations on mount
    useEffect(() => {
        const fetchLocations = async () => {
            const { data } = await supabase.from('delivery_locations').select('*').eq('is_active', true);
            if (data && data.length > 0) {
                setLocations(data);
                setLocationId(data[0].id); // default to first
            }
        };
        fetchLocations();
    }, []);

    // Listen to real-time updates for the active order
    useEffect(() => {
        if (!activeOrder) return;
        
        const subscription = supabase.channel(`order_updates_${activeOrder.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'requests', filter: `id=eq.${activeOrder.id}` }, 
            (payload) => {
                setActiveOrder(payload.new);
            }).subscribe();

        return () => supabase.removeChannel(subscription);
    }, [activeOrder]);

    const handleSubmit = async () => {
        if (!request.trim()) return alert('Please enter a food request.');
        
        // Mocking user ID for now
        const mockStudentId = 'u1111111-1111-1111-1111-111111111111';

        const { data, error } = await supabase.from('requests').insert([
            { student_id: mockStudentId, delivery_location_id: locationId, request_text: request, budget_range: budget }
        ]).select().single();

        if (error) {
            alert('Failed to place order: ' + error.message);
            return;
        }

        setActiveOrder(data);
    };

    if (activeOrder) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Live Order Tracking</Text>
                <View style={styles.card}>
                    <Text style={styles.orderId}>Order: {activeOrder.id.substring(0,8)}</Text>
                    <Text>Request: {activeOrder.request_text}</Text>
                    
                    <View style={styles.statusBar}>
                        <Text style={styles.statusText}>Current Status:</Text>
                        <Text style={styles.badge}>{activeOrder.status.replace('_', ' ').toUpperCase()}</Text>
                    </View>

                    <Button title="Open Chat with Rider" onPress={() => navigation.navigate('Chat', { role: 'student', requestId: activeOrder.id })} />
                </View>

                {activeOrder.status === 'delivered' && (
                    <View style={{marginTop: 20}}>
                        <Button title="Place New Order" color="#10b981" onPress={() => setActiveOrder(null)} />
                    </View>
                )}
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>What do you want to eat?</Text>
            <Text style={styles.subtitle}>Order from North Campus or South Plaza Cafeteria</Text>
            
            <View style={styles.formGroup}>
                <Text style={styles.label}>Your Request</Text>
                <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="e.g., Rice and chicken with a drink (no spicy sauce)"
                    multiline
                    value={request}
                    onChangeText={setRequest}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Estimated Budget (Optional)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="$10.00"
                    keyboardType="numeric"
                    value={budget}
                    onChangeText={setBudget}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Deliver To (Approved Locations Only)</Text>
                <PickerMock selectedValue={locations.find(l => l.id === locationId)?.name || 'Loading...'} onValueChange={setLocationId} />
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>Find a Rider</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flexGrow: 1, backgroundColor: '#f8fafc' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 5 },
    subtitle: { fontSize: 14, color: '#64748b', marginBottom: 20 },
    formGroup: { marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#334155' },
    input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, backgroundColor: 'white' },
    pickerContainer: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, backgroundColor: 'white' },
    submitBtn: { backgroundColor: '#3b82f6', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, marginBottom: 20 },
    orderId: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    statusBar: { marginVertical: 15, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8 },
    statusText: { fontSize: 12, color: '#64748b' },
    badge: { fontSize: 16, fontWeight: 'bold', color: '#f59e0b', marginTop: 5 }
});
