import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { styles } from '../styles/styles'

const FooterPDF = ({ page }: { page: number }) => {
    return (
        <View style={styles.footer}>
            <Text>Page {page}</Text>
        </View>
    )
}

export default FooterPDF
