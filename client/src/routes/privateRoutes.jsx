import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// useAuth turime importuoti, kad pasiekti user ir isLoading duomenis
import { useAuth } from '../hooks/useAuth';

// children yra komponentas, kuris bus pateiktas PrivateRoute komponento viduje
// roles yra masyvas, kuris turi vartotojo roles, kurie gali pasiekti šį komponentą
function PrivateRoute({ children, roles }) {
  // iš useAuth() metodo ištraukiame isLoading ir user duomenis
  const { isLoading, user } = useAuth();
  const navigate = useNavigate();

  // tada mes naudojame useEffect() metodą, kad patikrinti ar vartotojas yra prisijungęs ir ar jis turi roles, kurie gali pasiekti šį komponentą
  useEffect(() => {
    // turi būti isLoading ir user, nes jeigu nėra user, tai vartotojas nėra prisijungęs
    // ir jeigu roles nėra, tai vartotojas neturi roles, kurie gali pasiekti šį komponentą
    // todėl mes nukreipiame vartotoją į pagrindinį puslapį '/'
    if (!isLoading && (!user || !roles.includes(user.role))) {
      navigate('/');
    }
    // isLoading, user, roles, navigate yra kintamieji, kurie yra naudojami useEffect() metode
    // Naudoti reikia, kad patikrinti ar vartotojas yra prisijungęs ir ar jis turi roles, kurie gali pasiekti šį komponentą
  }, [isLoading, user, roles, navigate]);

  if (isLoading) {
    return null; // = loading spinner
  }

  return children;
}

export default PrivateRoute;
