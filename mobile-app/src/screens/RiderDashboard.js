import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button } from 'react-native';
import { supabase } from '../supabase';

export default function RiderDashboard({ navigation }) {
    const [available, setAvailable] = useState([]);
    const [activeDelivery, setActiveDelivery] = useState(null);

    // Mock rider ID
    const mockRiderId = 'u2222222-2222-2222-2222-222222222222';

    // Fetch initial requests and listen for new ones
    useEffect(() => {
        const fetchAvailable = async () => {
            const { data } = await supabase.from('requests').select('*, delivery_locations(name)').eq('status', 'request_sent');
            if (data) setAvailable(data);
        };
        fetchAvailable();

        const sub = supabase.channel('public:requests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, () => {
                fetchAvailable(); // Refetch on any change (new order, or someone else took it)
            }).subscribe();

        return () => supabase.removeChannel(sub);
    }, []);

    const acceptOrder = async (order) => {
        // Set status to accepted
        const { error: reqErr } = await supabase.from('requests').update({ status: 'accepted' }).eq('id', order.id);
        if (reqErr) return alert('Error accepting:', reqErr.message);

        // Bind rider to delivery
        const { error: delErr } = await supabase.from('deliveries').insert([{ request_id: order.id, rider_id: mockRiderId }]);
        if (delErr) return alert('Error binding delivery:', delErr.message);

        setActiveDelivery({ ...order, status: 'accepted' });
    };

    const advanceStatus = async () => {
        const statuses = ['accepted', 'at_cafeteria', 'on_way', 'delivered'];
        const currentIdx = statuses.indexOf(activeDelivery.status);
        
        if (currentIdx < statuses.length - 1) {
            const nextStatus = statuses[currentIdx + 1];
            await supabase.from('requests').update({ status: nextStatus }).eq('id', activeDelivery.id);
            setActiveDelivery({ ...activeDelivery, status: nextStatus });
        } else {
            setActiveDelivery(null); // Completed, go back to dash
        }
    };

    if (activeDelivery) {
        return (
            <View style={styles.container}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>Active Delivery</Text>
                    <View style={styles.onlineBadge}><Text style={{color:'white', fontSize: 12}}>Online</Text></View>
                </View>
                
                <View style={styles.card}>
                    <Text style={styles.orderId}>Order: {activeDelivery.id.substring(0,8)}</Text>
                    <Text>Item: {activeDelivery.request_text}</Text>
                    <Text>Dropoff: {activeDelivery.delivery_locations?.name || 'Loading...'}</Text>
                    
                    <View style={styles.statusBar}>
                        <Text style={styles.statusText}>Current Stage:</Text>
                        <Text style={styles.badge}>{activeDelivery.status.replace('_', ' ').toUpperCase()}</Text>
                    </View>

                    <Button title="Update Status Forward" onPress={advanceStatus} />
                    <View style={{ height: 10 }} />
                    <Button title="Chat with Student" color="#8b5cf6" onPress={() => navigation.navigate('Chat', { role: 'rider', requestId: activeDelivery.id })} />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Available Orders</Text>
                <View style={styles.onlineBadge}><Text style={{color:'white', fontSize: 12}}>Online</Text></View>
            </View>

            <FlatList
                data={available}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.orderId}>Order: {item.id.substring(0,8)}</Text>
                        <Text style={{ marginBottom: 5 }}>Request: {item.request_text}</Text>
                        <Text style={{ color: '#64748b', marginBottom: 15 }}>Deliver to {item.delivery_locations?.name || 'Unknown'}</Text>
                        <TouchableOpacity style={styles.acceptBtn} onPress={() => acceptOrder(item)}>
                            <Text style={styles.acceptText}>Accept Delivery</Text>
                        </TouchableOpacity>
                    </View>
                )}
                ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 40}}>No orders right now.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, flex: 1, backgroundColor: '#f8fafc' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
    title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a' },
    onlineBadge: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    card: { backgroundColor: 'white', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2, marginBottom: 15 },
    orderId: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
    acceptBtn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center' },
    acceptText: { color: 'white', fontWeight: 'bold' },
    statusBar: { marginVertical: 15, padding: 10, backgroundColor: '#f1f5f9', borderRadius: 8 },
    statusText: { fontSize: 12, color: '#64748b' },
    badge: { fontSize: 16, fontWeight: 'bold', color: '#10b981', marginTop: 5 }
});
