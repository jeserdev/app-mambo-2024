import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'

const PrivacyPolicyModal = ({ isVisible, onClose, onAccept }) => {
  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Política de Privacidad y Aviso Legal </Text>
          <ScrollView style={styles.policyTextContainer}>
          

<View style={styles.section}>
  <Text style={styles.sectionTitle}>Aviso Legal:</Text>
  <Text style={styles.policyText}>
    El presente Aviso Legal regula el uso del servicio de la App cuyo responsable a efectos identificativos es:
  </Text>
  <View style={styles.listContainer}>
    <Text style={styles.listItem}>• Responsable: Mambo Fresh, S.L.</Text>
    <Text style={styles.listItem}>• CIF: B85933158</Text>
    <Text style={styles.listItem}>• Dirección: Merca Madrid, Nave Plátanos 1, Madrid, 28053, Madrid.</Text>
    <Text style={styles.listItem}>• Mail: admin@mambofresh.es</Text>
  </View>
  <Text style={styles.policyText}>
    Legislación
    Con carácter general las relaciones entre el Responsable con los Usuarios de sus servicios telemáticos, presentes en la App, se encuentran sometidas a la legislación y jurisdicción españolas.
    Las partes renuncian expresamente al fuero que les pudiera corresponder y someten expresamente a los Juzgados y Tribunales de Madrid para resolver cualquier controversia que pueda surgir en la interpretación o ejecución de las presentes condiciones contractuales.

    Contenido y uso
    El Usuario queda informado, y acepta, que el acceso a la presente App no supone, en modo alguno, el inicio de una relación comercial con el Responsable.
    El titular del App no se identifica con las opiniones vertidas en el mismo por sus colaboradores. La Empresa se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su App, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados en sus servidores.

    Propiedad intelectual e industrial
    Este App y los contenidos que alberga se encuentran protegidos por las leyes de Propiedad Intelectual. No podrán ser objeto de explotación, reproducción, distribución, modificación, comunicación pública, cesión o transformación. El acceso a este App no otorga a los usuarios derecho, ni titularidad alguna sobre los derechos de propiedad intelectual de los contenidos que alberga esta App.

    El contenido de este App puede ser descargado al terminal del usuario (download), siempre que sea para su uso privado y sin ningún fin comercial; por lo tanto, no podrá explotar, reproducir, distribuir, modificar, comunicar públicamente, ceder, transformar o usar el contenido de esta App con fines públicos o comerciales.

    El nombre comercial, las marcas, logo, productos y servicios que contiene esta App se encuentran protegidos por ley.

    El Responsable se reserva la posibilidad de ejercer las acciones judiciales que correspondan contra los usuarios que violen o infrinjan los derechos de propiedad intelectual.

    Enlaces (Links)
    La presencia de enlaces (links) en App del Responsable tiene finalidad meramente informativa y en ningún caso supone sugerencia, invitación o recomendación sobre los mismos. 
  </Text>
</View>

<View style={styles.section}>
  <Text style={styles.sectionTitle}>POLÍTICA DE PRIVACIDAD:</Text>
  <Text style={styles.policyText}>
    La presente Política de Privacidad regula el uso del servicio del portal de Internet con dirección MAMBOFRESH.ES,cuyo responsable a efectos identificativos es:
  </Text>
  <View style={styles.listContainer}>
    <Text style={styles.listItem}>Responsable: MAMBO FRESH, S.L.</Text>
    <Text style={styles.listItem}>NIF: B85933158</Text>
    <Text style={styles.listItem}>Dirección: MERCA MADRID NAVE PLÁTANOS 1</Text>
    <Text style={styles.listItem}>Teléfono: 663783555</Text>
    <Text style={styles.listItem}>Mail: ADMIN@MAMBOFRESH.ES</Text>
  </View>

  <Text style={styles.sectionTitle}>Finalidad, ¿Para qué tratamos sus datos?</Text>
  <Text style={styles.policyText}>
  A efecto de lo previsto en RGPD de 27 de abril de 2016, y la LO 3/2018, trataremos los datos que recojamos paralas siguientes finalidades:
Contactar con usted en caso de que así nos lo pida.
Gestionar su navegación en la web, en su caso.
Remitirle comunicaciones comerciales acerca de nuestros productos y servicios.
(*)Gestionar las compras de productos ofertados en la web añadidos en la cesta.
Para ello el usuario dispondrá de un formulario de registro cuya cumplimentación legitimará al interesado alacceso y disfrute de determinados servicios ofrecidos en la web.
No obstante, se informa al usuario que en todo formulario de contacto el mismo será informado del uso que sehará de los datos obtenidos y, si son utilizados para un fin distinto, dicho consentimiento se obtendrápreviamente y de manera expresa.
Si el consentimiento del interesado se da en el contexto de una declaración escrita que también se refiera aotros asuntos, la solicitud de consentimiento se presentará de tal forma que se distinga claramente de los demásasuntos, de forma inteligible y de fácil acceso y utilizando un lenguaje claro y sencillo, de conformidadcon el artículo 7.2 del RGPD de 27 de abril de 2016.

  </Text>
  <Text style={styles.sectionTitle}>Legitimación, ¿Cuál es la legitimación para el tratamiento de sus datos?</Text>
  <Text style={styles.policyText}>

  La base legal para el tratamiento de sus datos se basará en:
El consentimiento del interesado, para el tratamiento de sus datos, conforme el artículo 6. 1. a) delReglamento General Europeo de Protección de Datos.
La necesaria ejecución de un contrato en el que el interesado es parte o para la aplicación a peticiónde este de medidas precontractuales, conforme el artículo 6. 1. b) del Reglamento General Europeo deProtección de Datos.

  </Text>

  <Text style={styles.sectionTitle}>
  Destinatarios ¿A quién comunicamos tus datos?
  </Text>

  <Text style={styles.policyText}>
  Los datos personales no serán objeto de cesión salvo en el cumplimiento de obligaciones legalmente establecidaso para dar soporte a los servicios vinculados a este tratamiento.
  </Text>

  <Text style={styles.sectionTitle}>
  Conservación, ¿Durante cuánto tiempo conservamos tus datos?
  </Text>
  <Text style={styles.policyText}>
  Conservaremos sus datos de carácter personal durante al menos 5 años en caso de que sea cliente y para elestricto cumplimiento de las obligaciones legales establecidas en la normativa.
En caso de no ser cliente conservaremos sus datos el mínimo tiempo indispensable para gestionar nuestra relación.
</Text>


<Text style={styles.sectionTitle}>
Derechos, ¿Cuáles son tus derechos cuando nos facilitas tus datos?
  </Text>
  <Text style={styles.policyText}>
  Cualquier persona tiene derecho a obtener confirmación sobre si se están tratando datos personales que le conciernan.
Las personas interesadas tienen derecho a poder acceder a sus datos personales, así como a solicitar la rectificaciónde los datos inexactos o, en su caso, solicitar su supresión cuando, entre otros motivos, los datos ya no seannecesarios para los fines que fueron recogidos.
En determinadas circunstancias, las personas interesadas podrán solicitar la limitación del tratamiento de sus datos,en cuyo caso únicamente los conservaremos para el ejercicio o la defensa de reclamaciones.
En determinadas circunstancias y por motivos relacionados con su situación particular, las personas interesadaspodrán oponerse al tratamiento de sus datos. En tal caso, dejarán de tratarse los datos, salvo por motivoslegítimos o el ejercicio o la defensa de posibles reclamaciones.
Las personas interesadas podrán solicitar la portabilidad de los datos para obtener los datos que han proporcionadoen un formato estructurado, de uso común y de lectura mecánica, para ser descargados por sí mismos o transmitidosa otra entidad.
La persona interesada puede ejercitar sus derechos dirigiendo un correo electrónico a la dirección de correoelectrónico ADMIN@MAMBOFRESH.ES, o en su caso a la dirección física MERCA MADRID NAVE PLÁTANOS 1.

</Text>


<Text style={styles.sectionTitle}>
Consentimiento menores, ¿Qué pasa si eres menor de edad?
  </Text>
  <Text style={styles.policyText}>
  En el supuesto que algunos de nuestros servicios vayan dirigidos específicamente a menores de catorce años,solicitaremos la conformidad de los padres o tutores para la recogida de los datos personales o, en su caso,para el tratamiento automatizado de los datos conforme el artículo 7 de la LOPDGDD.

</Text>

<Text style={styles.sectionTitle}>
Exactitud, veracidad y seguridad de los datos, ¿Cómo tratamos tus datos?
  </Text>
  <Text style={styles.policyText}>
  El Usuario es el único responsable de la veracidad y corrección de los datos incluidos, exonerándonos decualquier responsabilidad al respecto. Los usuarios garantizan y responden, en cualquier caso, de la exactitud,vigencia y autenticidad de los datos personales facilitados, y se comprometen a mantenerlos debidamente actualizados. El usuario acepta proporcionar información completa y correcta en los formularios de registroo suscripción. No responderemos de la veracidad de las informaciones que no sean de elaboración propia y delas que se indique otra fuente, por lo que tampoco asume responsabilidad alguna en cuanto a hipotéticos perjuiciosque pudieran originarse por el uso de dicha información.
También reservaremos el derecho a actualizar, modificar o eliminar la información contenida en la web pudiendo incluso limitar o no permitir el acceso a dicha información. No seremos responsables ante cualquier daño o perjuicio que pudiera sufrir el Usuario como consecuencia de errores, defectos u omisiones, en la información facilitada por el responsable siempre que proceda de fuentes ajenas.
Los datos serán tratados de forma confidencial y bajo el sometimiento a medidas técnicas y organizativas de seguridad adecuadas para evitar su alteración, pérdida, tratamiento o acceso no autorizado.
Podrá presentar una reclamación ante la Agencia Española de Protección de Datos, especialmente cuando no haya obtenido satisfacción en el ejercicio de sus derechos, en la dirección postal y/o electrónica indicada en la página mambofresh.es


</Text>




</View>
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onAccept}>
              <Text style={styles.buttonText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo semi-transparente
  },
  modalContent: {
    backgroundColor: '#f2e8d1',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%', // Limitar la altura máxima del modal
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#024936',
  },
  titleIn: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#024936',
  },

  policyTextContainer: {
    maxHeight: '100%', // Limitar la altura del texto para permitir el scroll
    marginBottom: 10,
  },
  policyText: {
    fontSize: 14,
    color: '#024936',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
  },
  button: {
    height: 40,
    
    backgroundColor: '#ed7400',
    padding: 10,
    borderRadius: 85,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',

  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    marginBottom: 5, 
    color: '#013024',
  },
  listItem: { 
    fontSize: 14, 
    marginBottom: 3,
    color: '#013024', 
  },


})

export default PrivacyPolicyModal
