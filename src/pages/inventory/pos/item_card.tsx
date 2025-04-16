interface props {
    image: string,
    name: string,
    price: string,
    addItem: () => void
    item: any
}

const PosItemCard: React.FC<props> = ({ image, name, price, addItem, item }) => {
    return (
      <div
        className="w-44 bg-white border cursor-pointer rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
        onClick={addItem}
      >
        <img
          src={image || "https://via.placeholder.com/150?text=No+Image"}
          alt={name}
          className="w-full h-32 object-cover"
        />
        <div className="p-4 text-center">
          <h3 className="text-md font-semibold">{name}</h3>
          <p className="text-lg text-teal-500 font-bold mt-2">
            UGX {price} / {item.unit_of_measure.abbreviation}
          </p>
        </div>
      </div>
    );
  };

  export default PosItemCard