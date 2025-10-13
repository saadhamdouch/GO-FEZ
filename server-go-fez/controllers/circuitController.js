const { Circuit, Theme, POI, ThemeCircuit, CircuitPOI, City } = require('../models');

exports.createCircuitWithRelations = async (req, res) => {
  try {
    // 1. Création du circuit
    const circuit = await Circuit.create(req.body.circuit);

    // 2. Lier les thèmes si fournis
    if (req.body.themeIds && req.body.themeIds.length > 0) {
      await circuit.setThemes(req.body.themeIds); 
      // Sequelize va remplir la table pivot ThemeCircuit
    }

    // 3. Lier les POIs si fournis
    if (req.body.pois && req.body.pois.length > 0) {

      for (const poiItem of req.body.pois) {
        await CircuitPOI.create({
          circuitId: circuit.id,
          poiId: poiItem.poiId,
          order: poiItem.order || null,
          estimatedTime: poiItem.estimatedTime || null
        });
      }
    }

    // 4. Récupérer le circuit avec relations peuplées
    const circuitWithRelations = await Circuit.findByPk(circuit.id, {
      include: [
        { model: Theme, as: 'themes' },
        { model: POI, as: 'pois' }
      ]
    });

    res.status(201).json({ status: 'success', data: circuitWithRelations });

  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};


exports.getAllCircuits = async (req, res) => {
  try {
    const circuits = await Circuit.findAll({
      include: [
        { model: City, as: 'city' },
        { model: Theme, through: ThemeCircuit, as: 'themes' },
        { model: POI, as: 'pois' }
      ]
    });
    res.status(200).json({ status: 'success', data: circuits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};

exports.getCircuitById = async (req, res) => {
  try {
    const { id } = req.params;
    const circuit = await Circuit.findByPk(id, {
      include: [
        { model: City, as: 'city' },
        { model: Theme, through: ThemeCircuit, as: 'themes' },
        { model: POI, as: 'pois' }
      ]
    });

    if (!circuit)
      return res.status(404).json({ status: 'fail', message: 'Circuit non trouvé' });

    res.status(200).json({ status: 'success', data: circuit });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};

exports.updateCircuit = async (req, res) => {
  try {
    const { id } = req.params;
    const { themeIds, poiIds, ...circuitData } = req.body;

    const circuit = await Circuit.findByPk(id);
    if (!circuit)
      return res.status(404).json({ status: 'fail', message: 'Circuit non trouvé' });

    await circuit.update(circuitData);

    // Mise à jour des relations
    if (themeIds) await circuit.setThemes(themeIds);
    if (poiIds) await circuit.setPois(poiIds);

    const circuitUpdated = await Circuit.findByPk(id, {
      include: [
        { model: City, as: 'city' },
        { model: Theme, through: ThemeCircuit, as: 'themes' },
        { model: POI, as: 'pois' }
      ]
    });

    res.status(200).json({ status: 'success', data: circuitUpdated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};

exports.deleteCircuit = async (req, res) => {
  try {
    const { id } = req.params;
    const circuit = await Circuit.findByPk(id);
    if (!circuit)
      return res.status(404).json({ status: 'fail', message: 'Circuit non trouvé' });

    await circuit.destroy();
    res.status(204).json({ status: 'success', message: 'Circuit supprimé' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Erreur serveur', error });
  }
};
