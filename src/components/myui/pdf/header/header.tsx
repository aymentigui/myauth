import React from 'react'
import { Text, View } from '@react-pdf/renderer';
import { styles } from '../styles/styles';


const HeaderPDF = () => {
    return (
        <View style={styles.header}>
            <Text>Aimen</Text>
        </View>
    )
}

export default HeaderPDF
