import { Car } from "../../features/cars/model/car.types";
import CarList from "../../features/cars/components/CarList";
import CatalogRecommendations from "../../features/cars/components/CatalogRecommendations";

type Props = {
  favs: Set<string>;
  onFav: (id: string) => void;
  onOpen: (car: Car) => void;
};

const CarsPage = ({ favs, onFav, onOpen }: Props) => (
  <div className="page-wrap">
    <h1 className="page-title">Каталог автомобилей</h1>
    <CatalogRecommendations favs={favs} onFav={onFav} onOpen={onOpen} />
    <CarList favs={favs} onFav={onFav} onOpen={onOpen} />
  </div>
);

export default CarsPage;
