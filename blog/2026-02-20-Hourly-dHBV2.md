---
title: "Building Bridges: CIROH-Penn State Collaboration Formalizes Differentiable Modeling for NRDS"
description: "Collaboration between CIROH and Penn State introduces differentiable models to the Next Generation Research Data Stream."
slug: ciroh-psu-collab
tags: [CIROH, Blog, Alabama Water Institute, Pennsylvania State University, Hydrology, Differentiable Modeling, NextGen, NGIAB, NRDS, National Water Model, Cloud Services, AI and Machine Learning]
authors: [leo, quinn, josh, ben, arpita-2025]
image: /img/blog/2025-10-psu-collab/carousel-1.jpeg
---

import useBaseUrl from "@docusaurus/useBaseUrl"
import { Carousel } from "react-responsive-carousel"

<Carousel
  showThumbs={false}
  autoPlay={true}
  stopOnHover={false}
  useKeyboardArrows={true}
  emulateTouch={true}
  interval={3500}
  infiniteLoop
  showStatus={false}
  showIndicators={true}
  >
  <div style= {{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <img src={useBaseUrl("/img/blog/2025-10-psu-collab/carousel-1.jpeg")}
      style={{ width: 'auto', maxHeight: '500px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
      alt="Assemblage of collaborators at AWI and Penn State"
      />
  </div>
  <div style= {{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <img src={useBaseUrl("/img/blog/2025-10-psu-collab/carousel-2.jpeg")}
      style={{ width: 'auto', maxHeight: '500px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
      alt="Leo Lonzarich, Quinn Lee, and Arpita Patel at University of Alabama's Diwali event"
      />
  </div>
  <div style= {{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <img src={useBaseUrl("/img/blog/2025-10-psu-collab/carousel-3.jpeg")}
      style={{ width: 'auto', maxHeight: '500px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
      alt="Josh Cunningham, Quinn Lee, and Leo Lonzarich deep in a debugging session"
      />
  </div>
</Carousel>
<br />

In October 2025, research efforts from Penn State's MHPI group, led by Dr. Chaopeng Shen, and AWI, led by Arpita Patel, converged in a milestone R2O effort that resulted in preliminary operationalization of the daily-scale, high-resolution, distributed differentiable model δHBV 2.0 [2]. This not only resulted in the adoption of a differentiable model into NextGen In A Box (NGIAB), but also provided an opportunity for CIROH researchers to fine-tune the δHBV 2.0 architecture for NextGen operation in addition to providing valuable insights and resources for accelerating this integration in the future.

Having proven viability for daily timescale predictions on high-resolution river networks [2], MHPI researchers recently adapted δHBV 2.0 into a multi-timescale architecture designed to parameterize HBV and simulate streamflow at hourly intervals, at scale, accross the NextGen HydroFabric. This new model, coined δHBV 2.0 MTS (Multi-TimeScale), is a fusion of a daily and hourly δHBV 2.0 model designed to efficiently handle ML training with high geospatial *and* temporal complexity. (See [MTS Architecture](#mts-architecture-3) for more details about this construction.)

With δHBV 2.0 MTS maintaining similar forecasting skill compared to its daily-scale counterpart [3], Penn State and AWI were once again reunited in a joint effort to plant hourly scale differentiable modeling within AWI's operational ecosystem as a demonstration of model viability and to enable open access to its runtime.

## Building A Stronger Bridge

In order to support δHBV 2.0 MTS in AWI's NextGen, NGIAB, and NGIAB Data-Preprocess required significant contributions and dialogue between both institutions.

From the Penn State's end, Leo Lonzarich produced an overhaul of the existing [dhbv2](https://github.com/mhpi/dhbv2) NextGen module supporting the new MTS architecture. In the case of MTS, three critical challenges needed resolution for NextGen deployment: 1) recurrence, 2) absence of daily forcing data, and 3) no derived PET forcing.

In the first case, both parameterization LSTM and physical backbone (HBV) depend on past temporal data to make future predictions (with some warmup period to initialize their internal states). Therefore, a new ring buffer mechanism was incorporated in the BMI module to support caching batches of input forcings to warmup states (more efficient than sequential) before running the differentiable model sequentially forward in time with the initialized states. It is also important to note that, while δHBV 2.0 MTS requires both a daily and hourly forcing input, NextGen is intended to only provide hourly AORC forcings in current operational arrangements. In such a case, the ring buffer here was also designed to aggregate hourly forcings to daily scale over the duration of NextGen runtime.

The last step to solve was replacing one of the standard inputs for δHBV 2.0 MTS, Hargreaves PET (disaggregated to hourly scale), which was required to be computed in advance of NextGen runtime. (Because Hargreaves' method is fundamentally an daily measure requiring all observations for a given day to compute, this was a fundamentally incompatible with calculation within the MTS BMI.) To resolve this, a Penman-Monteith calculation was added within the BMI to calculate PET on-the-fly during operations. It should be noted that this new input is not a 1:1 replacement for Hargreaves, and the trained weights used for the paramaterization networks in δHBV 2.0 MTS will need to be retrained.

~

From AWI's side, Quinn Lee and Josh Cunningham, with help from Benjamin Lee, handled the integration and evaluation of the dhbv2 module with both daily and hourly models in the NGIAB services. In particular, this involved 1) accurate production of all inputs (forcings, bmi configs, ngen realizations) needed for runtime in NextGen, 2) validation of the BMI runtime in NextGen, and 3) Adding dhbv2 setup to NGIAB and ensuring compatibility with other existing modules. Of these, compatibility was among the most substantial efforts, requiring revisions to both the dhbv2 module and NGIAB Dockerfile to support the integration without bloating or overcomplicating the resulting NextGen Docker images.

## Model Details

To better illustrate the architecture of δHBV 2.0 MTS, it is instructive to first characterize the daily model.

### δHBV 2.0 [2]

The daily model uses an LSTM and MLP to learn parameters for the differentiable physical model HBV 2.0. Weather forcings (precipitation, temperature, PET) and static catchment attributes are used as inputs to simulate hydrological states and fluxes:

$$
    \begin{align}
    \theta_{d, m}^{1:t} &= \text{LSTM}( x_m^{1:t}, A_m ) \\
    \theta_{s, m} &= \text{MLP}( A_m ) \\
    Q_k^{1:t}, S_k^{1:t} &= \text{HBV}(x_m^{1:t}, \theta_{d, m}^{1:t}, \theta_{s, m})
    \end{align}
$$

where:

* $\theta$: Learned dynamic ($d$) and static ($s$) parameters.
* $x_m, A_m$: Forcings and attributes for unit basin $m$.
* $Q, S$: Model fluxes (e.g., streamflow) and states (e.g., snowpack).

As this model is designed to operate at the daily timescale, forcings are aggregated at the end of every day to make a single daily prediction. This prediction is then distributed accross the proceeding 24 hours, at which point a new daily prediction is made.

Since HBV is a recurrent bucket-based model, it must be "warmed up" making simulations on a period of data just prior to the target simulation window so that it's states can be allowed to saturate. Incidentally, this process also initializes internal states of the parameterization LSTM.

### MTS Architecture [3]

The **Multi-TimeScale (MTS)** variant adapts the architecture for hourly simulation. It incorporates a rolling window input caching mechanism to bridge the gap between long-term hydrologic memory and high-frequency forcing:

* **Caching:** Caches ~351 days of aggregated daily inputs and ~7 days of hourly inputs.
* **Warmup:** Performs warmup steps using the cache to prime low-frequency (daily) and high-frequency (hourly) model states before generating hourly predictions.
* **Rolling Window**: After 7 days of hourly simulation, the cache window shifts forward 7 days and the warmup is repeated.

## Looking Skyward

With both daily- and hourly-scale δHBV 2.0 models implemented in NGIAB and the NGIAB Data-Preprocess, the next step forward is to adopt these models into the NextGen Research DataStream (NRDS) with the combined efforts of Lynker and AWI (and, naturally, Leo on-call). Work on this adoption is already slated and we anticipate having recurrent runtimes of both models with near-realtime simulations on the HydroFabric available to CIROH collaborators in the near future.

In the meantime, we continue to work with NOAA-OWP to support the integration of δHBV 2.0 MTS model integration into their NextGen test-bench for preliminary evaluation as candidate for the next-generation NWM.

With δHBV 2.0's integration near completion, differentiable models will soon be running as part of CIROH's NRDS nightly forecasts — accessible through the NRDS Visualizer where other researchers and community members will be able to explore, assess, and iterate on simulations from this latest crop of hydrologic models in real time.

We are also looking forward to the integration of differentiable routing products such as differentiable Muskingum-Cunge developed by Tadd Bindas et al. [1] at Penn State. While the form is not decided, this could appear as a dynamic parameterization module for T-Route or a standalone routing module. Current development is ongoing in [DDR](CITE).

In all cases, we anticipate the continuation of AWI-Penn State synergy into the future as we continue to support and potential integrate new models in their operational ecosystem. Some of these efforts may also arrive in DevCon later this spring as a showcase of this collaboration. Ultimately, these moments stand as testaments to the value of inter-institutional relationships for accelerating the integration of lab-bound research into operations for the broader CIROH community. Once more, the path from scientific discovery to operational forecasting remains focused and in view.

~

### Resources for the Curious 

* [δHBV 2.0 Operational Module Repository](https://github.com/mhpi/dhbv2)

* [δMG Differentiable Modeling Framework](https://github.com/mhpi/generic_deltamodel) (Backbone for δHBV 2.0; includes documentation and tutorials for building custom differentiable hydrologic models.)

* [Differentiable Distributed Routing (DDR)](https://github.com/DeepGroundwater/ddr)

* [MHPI Codebase](https://mhpi.github.io/codes/)

### Publication

<ol>
    <li>Bindas, T., Tsai, W.-P., Liu, J., Rahmani, F., Feng, D., Bian, Y., et al. (2024). Improving river routing using a differentiable Muskingum-Cunge model and physics-informed machine learning. Water Resources Research, 60, e2023WR035337. https://doi.org/10.1029/2023WR035337</li>
    <li>Song, Y., Bindas, T., Shen, C., Ji, H., Knoben, W. J. M., Lonzarich, L., et al. (2025). High-resolution national-scale water modeling is enhanced by multiscale differentiable physics-informed machine learning. Water Resources Research, 61, e2024WR038928. https://doi.org/10.1029/2024WR038928</li>
    <li>Yang, W., Ji, H., Lonzarich, L., Song, Y., Shen, C. (2025). Diffusion-Based Probabilistic Modeling for Hourly Streamflow Prediction and Assimilation. arXiv. https://arxiv.org/abs/2510.08488 [In Review]</li>
</ol>
