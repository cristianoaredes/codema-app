import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Maximize2, 
  Minimize2, 
  RotateCcw,
  Layers,
  Info,
  ExternalLink
} from "lucide-react";
import type { Denuncia } from "@/hooks/useOuvidoriaDenuncias";

interface DenunciaMapProps {
  denuncias: Denuncia[];
  selectedDenuncia?: Denuncia | null;
  onDenunciaSelect?: (denuncia: Denuncia) => void;
  className?: string;
}

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  denuncia: Denuncia;
  type: 'procedente' | 'improcedente' | 'em_apuracao' | 'pending';
}

const DenunciaMap: React.FC<DenunciaMapProps> = ({
  denuncias,
  selectedDenuncia,
  onDenunciaSelect,
  className = ""
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

  // Filtrar denúncias com coordenadas válidas
  const denunciasComLocalizacao = denuncias.filter(
    d => d.latitude && d.longitude && 
    d.latitude >= -90 && d.latitude <= 90 && 
    d.longitude >= -180 && d.longitude <= 180
  );

  const markers: MapMarker[] = denunciasComLocalizacao.map(denuncia => ({
    id: denuncia.id,
    lat: denuncia.latitude!,
    lng: denuncia.longitude!,
    denuncia,
    type: denuncia.status === 'procedente' ? 'procedente' :
          denuncia.status === 'improcedente' ? 'improcedente' :
          ['em_apuracao', 'fiscalizacao_agendada', 'fiscalizacao_realizada'].includes(denuncia.status) ? 'em_apuracao' :
          'pending'
  }));

  // Calcular centro do mapa baseado nas denúncias
  const getMapCenter = () => {
    if (markers.length === 0) {
      // Centro de Itanhomi-MG (aproximado)
      return { lat: -19.6047, lng: -42.1031 };
    }

    const centerLat = markers.reduce((sum, marker) => sum + marker.lat, 0) / markers.length;
    const centerLng = markers.reduce((sum, marker) => sum + marker.lng, 0) / markers.length;
    
    return { lat: centerLat, lng: centerLng };
  };

  const getMarkerColor = (type: MapMarker['type']) => {
    switch (type) {
      case 'procedente': return '#dc2626'; // vermelho
      case 'improcedente': return '#16a34a'; // verde
      case 'em_apuracao': return '#ea580c'; // laranja
      case 'pending': return '#6b7280'; // cinza
      default: return '#6b7280';
    }
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      queima_lixo: "Queima de Lixo",
      desmatamento: "Desmatamento",
      poluicao_agua: "Poluição da Água",
      poluicao_sonora: "Poluição Sonora",
      construcao_irregular: "Construção Irregular",
      outros: "Outros"
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const openInGoogleMaps = (lat: number, lng: number, address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&zoom=16`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    // Simular carregamento do mapa (no mundo real, seria Google Maps API, Leaflet, etc.)
    if (mapRef.current) {
      // Aqui seria inicializado o mapa real
      console.log('Mapa simulado carregado com', markers.length, 'marcadores');
    }
  }, [markers]);

  const center = getMapCenter();

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Denúncias
            </CardTitle>
            <CardDescription>
              {denunciasComLocalizacao.length} denúncias com localização registrada
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLayers(!showLayers)}
            >
              <Layers className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className={`relative ${isFullscreen ? 'h-screen' : 'h-96'}`}>
          {/* Map Container */}
          <div 
            ref={mapRef}
            className="w-full h-full bg-gray-100 relative overflow-hidden"
            style={{
              backgroundImage: `linear-gradient(45deg, #f3f4f6 25%, transparent 25%), 
                               linear-gradient(-45deg, #f3f4f6 25%, transparent 25%), 
                               linear-gradient(45deg, transparent 75%, #f3f4f6 75%), 
                               linear-gradient(-45deg, transparent 75%, #f3f4f6 75%)`,
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
            }}
          >
            {/* Map Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-blue-500 mb-2" />
                <p className="text-sm text-muted-foreground">
                  Mapa Interativo de Denúncias
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Centro: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
                </p>
              </div>
            </div>

            {/* Simulated Markers */}
            {markers.map((marker, index) => (
              <div
                key={marker.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
                  selectedDenuncia?.id === marker.denuncia.id ? 'z-20 scale-125' : 'z-10'
                }`}
                style={{
                  left: `${20 + (index % 5) * 15}%`,
                  top: `${30 + Math.floor(index / 5) * 20}%`
                }}
                onClick={() => onDenunciaSelect?.(marker.denuncia)}
              >
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: getMarkerColor(marker.type) }}
                >
                  <MapPin className="h-3 w-3 text-white" />
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity">
                  <div className="bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {marker.denuncia.protocolo}
                    <div className="text-xs opacity-75">
                      {getTipoLabel(marker.denuncia.tipo_denuncia)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button variant="outline" size="sm" className="bg-white">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Layers Panel */}
            {showLayers && (
              <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg border p-4 min-w-48">
                <h4 className="font-medium mb-3">Camadas do Mapa</h4>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="mapType"
                      checked={mapType === 'roadmap'}
                      onChange={() => setMapType('roadmap')}
                    />
                    Mapa de Ruas
                  </label>
                  
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="mapType"
                      checked={mapType === 'satellite'}
                      onChange={() => setMapType('satellite')}
                    />
                    Satélite
                  </label>
                  
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="mapType"
                      checked={mapType === 'hybrid'}
                      onChange={() => setMapType('hybrid')}
                    />
                    Híbrido
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-medium mb-2 text-sm">Legenda</h4>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-600"></div>
              <span>Procedente ({markers.filter(m => m.type === 'procedente').length})</span>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span>Em Apuração ({markers.filter(m => m.type === 'em_apuracao').length})</span>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span>Improcedente ({markers.filter(m => m.type === 'improcedente').length})</span>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-500"></div>
              <span>Pendente ({markers.filter(m => m.type === 'pending').length})</span>
            </div>
          </div>
        </div>

        {/* Selected Denuncia Info */}
        {selectedDenuncia && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{selectedDenuncia.protocolo}</h4>
              <Badge variant="outline">
                {getTipoLabel(selectedDenuncia.tipo_denuncia)}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">
              {selectedDenuncia.local_ocorrencia}
            </p>
            
            <p className="text-sm mb-3 line-clamp-2">
              {selectedDenuncia.descricao}
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (selectedDenuncia.latitude && selectedDenuncia.longitude) {
                    openInGoogleMaps(
                      selectedDenuncia.latitude, 
                      selectedDenuncia.longitude, 
                      selectedDenuncia.local_ocorrencia
                    );
                  }
                }}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Ver no Google Maps
              </Button>
              
              <Button variant="outline" size="sm">
                <Info className="h-3 w-3 mr-1" />
                Detalhes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DenunciaMap;