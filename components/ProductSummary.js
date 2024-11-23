const ProductSummary = ({ summary }) => {
  return (
    <View>
      {Object.keys(summary).map((product, index) => (
        <Text key={index}>{`${product}: ${summary[product]}`}</Text>
      ))}
    </View>
  )
}

export default ProductSummary
